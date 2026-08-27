# RideRoundUp - Brochure Data Extraction Guide

This guide contains the analysis of the RideRoundUp (RRU) vehicle data model, a strict JSON schema representation for extracted data, and a master prompt that can be used with Google Gemini to extract data from official vehicle brochure PDFs.

---

## 1. Analysis of the RRU Vehicle Data Structure

The RideRoundUp catalog is structured hierarchically. The relationships and constraints are defined below:

```mermaid
graph TD
    Brand -->|has many| Model
    Model -->|has many| Generation
    Generation -->|has many| Variant
    Variant -->|1-to-1| Specification
    Variant -->|many-to-many| Feature (via VariantFeature)
    Variant -->|many-to-many| Color (via VariantColor)
    Variant -->|many-to-many| Market (via VariantMarket)
    Variant -->|has many| Media
```

### Hierarchy & Entity Keys
- **Brand**: The root entity (e.g., Toyota, BMW). Identified by a unique `brandCode` (uppercase, e.g., `TOYOTA`) and a unique URL-friendly `slug` (lowercase, e.g., `toyota`).
- **Model**: Specific vehicle line (e.g., Land Cruiser, 3.5 Series). Linked to Brand via `brandId`. Identified by a unique `modelCode` (uppercase, e.g., `LAND-CRUISER`) and a unique `slug` (lowercase, e.g., `land-cruiser`).
- **Generation**: Identifies specific body style ranges / design runs of a model (e.g., "300 Series" for Land Cruiser). Linked to Model via `modelId`. Identified by a unique `generationCode` (uppercase, e.g., `LC300`) and a unique `slug` (lowercase, e.g., `lc-300`).
- **Variant**: The specific trim, engine, and equipment configuration of a vehicle (e.g., "GXR V6 2025"). Linked to Generation via `generationId`. Identified by a unique `variantCode` (uppercase, e.g., `LC-GXR-V6-25`) and a unique `slug` (lowercase, e.g., `toyota-land-cruiser-gxr-v6-2025`).

### Data Modeling Constraints
1. **Separation of Specifications**: First-class specifications (dimensions, performance, capacity, weight, fuel consumption, safety) are stored in a dedicated `Specification` collection pointing to the variant via `variantId` (1-to-1).
2. **Features & Colors**: Instead of flat attributes, Features (e.g., "Adaptive Cruise Control") and Colors (e.g., "Pearl White") are master collections. They are associated with a Variant using junction collections (`VariantFeature` and `VariantColor`) containing an `availability` flag (`standard`, `optional`, `unavailable`) and optional contextual descriptions.
3. **Markets & Pricing**: The `VariantMarket` entity links a Variant to a specific geographical Market (e.g., `UAE`). It holds the local `pricing` object `{ amount, currencyCode, priceType }` and market `availabilityStatus`.
4. **Media (Images/Videos)**: Images identified in the brochure must have an `angleTag` specifying the camera perspective (e.g., `exterior-front`, `interior`, `detail`). They can be optionally linked to a specific `colorId` if the image displays a specific paint color.

---

## 2. Reusable Master Gemini Extraction Prompt

Copy and paste the prompt block below into Gemini along with the vehicle brochure PDF.

```text
You are an expert automotive data analyst. Your task is to analyze the attached official vehicle brochure/catalogue PDF and extract all relevant information into a structured, machine-readable format.

You must strictly adhere to the following rules:
1. Extract ONLY information that is explicitly stated in the brochure.
2. Never invent, guess, or extrapolate missing specifications.
3. If a field is not mentioned in the brochure, mark it as `null`. Do not write placeholders like "N/A" or "TBD".
4. If there are multiple trims/variants in the brochure, keep their data completely separate in the `variants` array. Do not merge specs.
5. If there is a conflict in the brochure (e.g., one page says 5 doors, another says 4), do not choose. Set the field value to a string describing the conflict, e.g., "Conflict: Page 4 lists 4 doors, Page 12 lists 5".
6. Normalize all units to the RideRoundUp system (e.g., millimeters for dimensions, liters for capacity, horsepower (Hp) for power, Newton-meters (Nm) for torque, km/h for speed, seconds for 0-100 acceleration, cc for engine displacement).
7. For Colors and Features, map them to standard lowercase slugs (using hyphens).

Analyze the brochure and generate a single JSON object with the following keys:
- brandPayload: Info about the manufacturer.
- modelPayload: Info about the vehicle model line.
- generationPayload: Info about the specific vehicle design generation.
- variants: An array of objects, one for each variant/trim level found in the brochure. Each variant object must contain:
  - variantPayload: Core details (slug, code, year, engine displacement/aspiration, transmission, drivetrain, seating).
  - specificationsPayload: Performance, dimensions, weights, capacities, fuel economy, and safety equipment counts.
  - features: Array of features with name, category, and availability (standard, optional, unavailable).
  - colors: Array of colors with name, hexCode (if hex code or color sample is visible/known, otherwise null), type (exterior/interior), and availability.
  - marketPayload: UAE market pricing and availability if UAE specifications/currency are mentioned, or the respective market mentioned in the brochure.
  - mediaList: A list of key vehicle images identified on specific pages of the brochure (e.g., front view, dashboard, seats).

Follow this exact JSON structure:
{
  "brandPayload": {
    "brandCode": "UPPERCASE_CODE (e.g. TOYOTA)",
    "name": "Brand Name (e.g. Toyota)",
    "slug": "lowercase-slug (e.g. toyota)",
    "originCountryCode": "2-letter ISO (e.g. JP, DE, US, GB)"
  },
  "modelPayload": {
    "modelCode": "UPPERCASE_CODE (e.g. LAND-CRUISER)",
    "name": "Model Name (e.g. Land Cruiser)",
    "slug": "lowercase-slug (e.g. land-cruiser)",
    "bodyType": "SUV | Sedan | Coupe | Hatchback | Wagon | Pickup | Convertible | Van",
    "segment": "A | B | C | D | E | F | null (e.g. E)",
    "launchYear": 2025 (integer)
  },
  "generationPayload": {
    "generationCode": "UPPERCASE_CODE (e.g. LC300)",
    "name": "Generation name (e.g. 300 Series)",
    "generationNumber": 6 (integer, if known, else null),
    "startYear": 2021 (integer),
    "endYear": null (integer or null)
  },
  "variants": [
    {
      "variantPayload": {
        "variantCode": "UPPERCASE_CODE (e.g. LC-GXR-V6-25)",
        "name": "Variant Name (e.g. GXR V6)",
        "slug": "lowercase-slug (e.g. toyota-land-cruiser-gxr-v6-2025)",
        "description": "Short paragraph summary of this trim level's target audience and characteristics",
        "shortDescription": "One-line summary description of this variant",
        "modelYear": 2025 (integer),
        "fuelType": "petrol | diesel | hybrid | plug_in_hybrid | electric | cng | lpg | other",
        "transmissionType": "manual | automatic | cvt | dct | amt | other",
        "drivetrain": "fwd | rwd | awd | 4wd | other",
        "engine": {
          "displacementCc": 3445 (integer, or 0 for EVs),
          "cylinders": 6 (integer, or 0 for EVs),
          "aspiration": "naturally_aspirated | turbo | twin-turbo | supercharged | other (or null for EVs)",
          "powerHp": 409 (integer),
          "torqueNm": 650 (integer)
        },
        "seatingCapacity": 7 (integer),
        "doors": 5 (integer)
      },
      "specificationsPayload": {
        "performance": {
          "topSpeedKph": 210 (integer or null),
          "acceleration0To100Kph": 7.0 (number or null)
        },
        "dimensions": {
          "lengthMm": 4985 (integer or null),
          "widthMm": 1980 (integer or null),
          "heightMm": 1870 (integer or null),
          "wheelbaseMm": 2850 (integer or null),
          "groundClearanceMm": 235 (integer or null)
        },
        "capacity": {
          "bootSpaceLitres": 308 (integer or null),
          "fuelTankLitres": 110 (integer or null)
        },
        "weight": {
          "kerbWeightKg": 2500 (integer or null),
          "grossWeightKg": 3230 (integer or null)
        },
        "fuel": {
          "fuelEconomyCity": null (number or null),
          "fuelEconomyHighway": null (number or null),
          "fuelEconomyCombined": 11.4 (number or null, e.g. L/100km or km/L),
          "economyUnit": "L/100km | km/L | km/kWh | null"
        },
        "safety": {
          "airbags": 10 (integer or null),
          "abs": true (boolean or null),
          "tractionControl": true (boolean or null),
          "stabilityControl": true (boolean or null),
          "parkingSensors": "front and rear | front only | rear only | none | null",
          "camera": "none | rear view | 360-degree | null"
        }
      },
      "features": [
        {
          "name": "Feature Name (e.g. Adaptive Cruise Control)",
          "slug": "feature-slug (e.g. adaptive-cruise-control)",
          "category": "safety | exterior | interior | comfort | infotainment | convenience | performance | other",
          "availability": "standard | optional | unavailable",
          "value": "Optional short detail (e.g., 'with Stop & Go')"
        }
      ],
      "colors": [
        {
          "name": "Color Name (e.g. Pearl White)",
          "slug": "color-slug (e.g. pearl-white)",
          "hexCode": "HEX_VALUE_OR_NULL (e.g. #F5F5F0)",
          "type": "exterior | interior",
          "availability": "standard | optional | unavailable"
        }
      ],
      "marketPayload": {
        "marketCode": "UAE",
        "availabilityStatus": "available | unavailable | upcoming | discontinued",
        "isFeatured": false (boolean),
        "pricing": {
          "amount": 335000 (number),
          "currencyCode": "AED",
          "priceType": "starting | ex_showroom | on_road | msrp | other"
        }
      },
      "mediaList": [
        {
          "angleTag": "exterior-front | exterior-rear | exterior-side | interior | detail | overhead",
          "colorSlug": "associated-color-slug-or-null (e.g. pearl-white)",
          "pageNumber": 1 (integer, page in brochure where image is present),
          "shortDescription": "Describe what is shown (e.g., GXR trim front profile in Pearl White)",
          "recommendedFileName": "suggested_name.jpg (lowercase, e.g., toyota_land_cruiser_2025_gxr_v6_pearl-white_front.jpg)"
        }
      ]
    }
  ]
}
```

---

## 3. Sample Extraction Output

Below is a demonstration of how Gemini should structure the extracted data for a brochure of a hypothetical luxury vehicle:

```json
{
  "brandPayload": {
    "brandCode": "LEXUS",
    "name": "Lexus",
    "slug": "lexus",
    "originCountryCode": "JP"
  },
  "modelPayload": {
    "modelCode": "LEXUS-ES",
    "name": "Lexus ES",
    "slug": "lexus-es",
    "bodyType": "Sedan",
    "segment": "E",
    "launchYear": 2025
  },
  "generationPayload": {
    "generationCode": "ES7",
    "name": "Seventh Generation LCI",
    "generationNumber": 7,
    "startYear": 2018,
    "endYear": null
  },
  "variants": [
    {
      "variantPayload": {
        "variantCode": "ES350-PREST-25",
        "name": "ES 350 Prestige",
        "slug": "lexus-es-350-prestige-2025",
        "description": "The entry point to the Lexus ES executive sedan experience, balancing V6 refinement with luxury standards.",
        "shortDescription": "V6 executive comfort with Lexus craftsmanship",
        "modelYear": 2025,
        "fuelType": "petrol",
        "transmissionType": "automatic",
        "drivetrain": "fwd",
        "engine": {
          "displacementCc": 3456,
          "cylinders": 6,
          "aspiration": "naturally_aspirated",
          "powerHp": 302,
          "torqueNm": 361
        },
        "seatingCapacity": 5,
        "doors": 4
      },
      "specificationsPayload": {
        "performance": {
          "topSpeedKph": 210,
          "acceleration0To100Kph": 6.6
        },
        "dimensions": {
          "lengthMm": 4975,
          "widthMm": 1865,
          "heightMm": 1445,
          "wheelbaseMm": 2870,
          "groundClearanceMm": 150
        },
        "capacity": {
          "bootSpaceLitres": 420,
          "fuelTankLitres": 60
        },
        "weight": {
          "kerbWeightKg": 1680,
          "grossWeightKg": 2100
        },
        "fuel": {
          "fuelEconomyCity": 11.2,
          "fuelEconomyHighway": 7.4,
          "fuelEconomyCombined": 8.8,
          "economyUnit": "L/100km"
        },
        "safety": {
          "airbags": 10,
          "abs": true,
          "tractionControl": true,
          "stabilityControl": true,
          "parkingSensors": "front and rear",
          "camera": "rear view"
        }
      },
      "features": [
        {
          "name": "Lexus Safety System+",
          "slug": "lexus-safety-system",
          "category": "safety",
          "availability": "standard",
          "value": "Includes Pre-Collision and Lane Trace Assist"
        },
        {
          "name": "Power Moonroof",
          "slug": "power-moonroof",
          "category": "comfort",
          "availability": "standard",
          "value": "One-touch tilt/slide"
        },
        {
          "name": "Mark Levinson Premium Audio",
          "slug": "mark-levinson-audio",
          "category": "infotainment",
          "availability": "optional",
          "value": "17-speaker surround sound"
        }
      ],
      "colors": [
        {
          "name": "Sonic Quartz",
          "slug": "sonic-quartz",
          "hexCode": "#F3F4F6",
          "type": "exterior",
          "availability": "standard"
        },
        {
          "name": "Chateau Nuance Leather",
          "slug": "chateau-leather",
          "hexCode": "#D2C4B1",
          "type": "interior",
          "availability": "standard"
        }
      ],
      "marketPayload": {
        "marketCode": "UAE",
        "availabilityStatus": "available",
        "isFeatured": true,
        "pricing": {
          "amount": 235000,
          "currencyCode": "AED",
          "priceType": "starting"
        }
      },
      "mediaList": [
        {
          "angleTag": "exterior-front",
          "colorSlug": "sonic-quartz",
          "pageNumber": 2,
          "shortDescription": "Front three-quarter view of the Lexus ES 350 in Sonic Quartz",
          "recommendedFileName": "lexus_es_350_2025_prestige_sonic-quartz_front.jpg"
        },
        {
          "angleTag": "interior",
          "colorSlug": "chateau-leather",
          "pageNumber": 7,
          "shortDescription": "Interior dashboard view highlighting the Chateau Nuance dashboard design",
          "recommendedFileName": "lexus_es_350_2025_prestige_chateau_interior.jpg"
        }
      ]
    }
  ]
}
```

---

## 4. Fields Requiring Manual Dashboard Verification

To ensure data integrity and avoid DB constraint failures, the following fields must be manually checked in the Admin Dashboard before executing the final import:

1. **Unique Code Generation**:
   - `brandCode`, `modelCode`, `generationCode`, and `variantCode` must be verified to ensure they do not clash with existing database keys.
   - Slugs (`brand.slug`, `model.slug`, `variant.slug`) must be validated for URL compliance and uniqueness.
2. **Lookup Key Linkage**:
   - Verify that the referenced `brandId` and `generationId` exist. If a new Model or Generation is introduced in the brochure, those parent records must be imported **first** to prevent reference constraint breaks.
3. **Master Features & Colors**:
   - Check if the extracted features (e.g., `lexus-safety-system`) and color names exist in the master `Feature` and `Color` collections. If a feature or color is new, it needs to be added to the master list first so that `VariantFeature` or `VariantColor` database records can reference its `ObjectId` correctly.
4. **Media Asset Filenames & Uploads**:
   - Brochure images must be downloaded, properly cropped/resized, and uploaded to the RideRoundUp S3 bucket.
   - The generated S3 URL and file metadata (`size`, `mimeType`) must be entered manually into the `Media` collection to link them to the newly imported Variant.
5. **Pricing Type Mapping**:
   - Confirm whether the pricing in the brochure corresponds to MSRP, ex-showroom, or a dealer starting price, and select the correct `priceType` enum value in the dashboard form.
