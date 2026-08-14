const fs = require('fs');
const yaml = require('yamljs');

const swaggerPath = 'src/docs/swagger.yml';
let swaggerDoc = fs.readFileSync(swaggerPath, 'utf8');

const componentsAddition = `
    VariantMarket:
      type: object
      properties:
        _id:
          type: string
          example: "64a2b1c3e4d5f6a7b8c9d0e1"
        variantId:
          type: string
          example: "64a2b1c3e4d5f6a7b8c9d0aa"
        marketId:
          type: string
          example: "64a2b1c3e4d5f6a7b8c9d0bb"
        availabilityStatus:
          type: string
          enum: [available, unavailable, upcoming, discontinued]
          example: "available"
        status:
          type: string
          enum: [active, inactive]
          example: "active"
        launchDate:
          type: string
          format: date-time
        discontinuedDate:
          type: string
          format: date-time
        pricing:
          type: object
          properties:
            amount:
              type: number
              example: 50000
            currencyCode:
              type: string
              example: "USD"
            priceType:
              type: string
              enum: [starting, ex_showroom, on_road, msrp, other]
              example: "msrp"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    CreateVariantMarketInput:
      type: object
      required:
        - variantId
        - marketId
      properties:
        variantId:
          type: string
        marketId:
          type: string
        availabilityStatus:
          type: string
          enum: [available, unavailable, upcoming, discontinued]
        status:
          type: string
          enum: [active, inactive]
        launchDate:
          type: string
          format: date-time
        discontinuedDate:
          type: string
          format: date-time
        pricing:
          type: object
          required:
            - amount
            - currencyCode
            - priceType
          properties:
            amount:
              type: number
            currencyCode:
              type: string
            priceType:
              type: string
              enum: [starting, ex_showroom, on_road, msrp, other]
`;

const pathsAddition = `
  /variant-markets:
    get:
      tags:
        - Variant Markets
      summary: List variant markets
      parameters:
        - in: query
          name: variantId
          schema:
            type: string
        - in: query
          name: marketId
          schema:
            type: string
        - in: query
          name: availabilityStatus
          schema:
            type: string
        - in: query
          name: status
          schema:
            type: string
        - in: query
          name: priceType
          schema:
            type: string
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: limit
          schema:
            type: integer
            default: 10
      responses:
        "200":
          description: List of variant markets
    post:
      tags:
        - Variant Markets
      summary: Create a variant market relationship
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateVariantMarketInput'
      responses:
        "201":
          description: Variant Market created
  /variant-markets/{id}:
    get:
      tags:
        - Variant Markets
      summary: Get variant market by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Variant Market details
    patch:
      tags:
        - Variant Markets
      summary: Update variant market
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                availabilityStatus:
                  type: string
                status:
                  type: string
                pricing:
                  type: object
      responses:
        "200":
          description: Variant Market updated
    delete:
      tags:
        - Variant Markets
      summary: Soft delete variant market
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Variant Market deleted
`;

// Insert the additions before the first path, which means after the schemas.
// The file has components: schemas: at the top. We can append to schemas if we find it.
// Actually, it's easier to just use `yamljs` to parse, add, and stringify?
// YAML.stringify loses comments and ordering. It's better to just string match.

swaggerDoc = swaggerDoc.replace(/  paths:/, componentsAddition + '\n  paths:');
swaggerDoc = swaggerDoc + pathsAddition;

fs.writeFileSync(swaggerPath, swaggerDoc);
console.log('Swagger updated');
