const fs = require('fs');

const swaggerPath = 'src/docs/swagger.yml';
let swaggerDoc = fs.readFileSync(swaggerPath, 'utf8');

if (!swaggerDoc.includes('Specification:')) {
  const componentsAddition = `
    Specification:
      type: object
      properties:
        _id:
          type: string
        variantId:
          type: string
        performance:
          type: object
          properties:
            topSpeedKph:
              type: number
            acceleration0To100Kph:
              type: number
        dimensions:
          type: object
          properties:
            lengthMm:
              type: number
            widthMm:
              type: number
            heightMm:
              type: number
            wheelbaseMm:
              type: number
            groundClearanceMm:
              type: number
        capacity:
          type: object
          properties:
            bootSpaceLitres:
              type: number
            fuelTankLitres:
              type: number
        weight:
          type: object
          properties:
            kerbWeightKg:
              type: number
            grossWeightKg:
              type: number
        fuel:
          type: object
          properties:
            fuelEconomyCity:
              type: number
            fuelEconomyHighway:
              type: number
            fuelEconomyCombined:
              type: number
            economyUnit:
              type: string
        safety:
          type: object
          properties:
            airbags:
              type: number
            abs:
              type: boolean
            tractionControl:
              type: boolean
            stabilityControl:
              type: boolean
            parkingSensors:
              type: string
            camera:
              type: string
        status:
          type: string
          enum: [active, inactive]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
`;

  swaggerDoc = swaggerDoc.replace('schemas:', 'schemas:' + componentsAddition);

  const pathsAddition = `
  /api/v1/specifications:
    get:
      tags:
        - Specifications
      summary: Get all specifications
      parameters:
        - in: query
          name: variantId
          schema:
            type: string
        - in: query
          name: status
          schema:
            type: string
        - in: query
          name: page
          schema:
            type: integer
        - in: query
          name: limit
          schema:
            type: integer
      responses:
        "200":
          description: Success
    post:
      tags:
        - Specifications
      summary: Create specification
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Specification'
      responses:
        "201":
          description: Created
        "409":
          description: Conflict
  /api/v1/specifications/{id}:
    get:
      tags:
        - Specifications
      summary: Get specification by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
    patch:
      tags:
        - Specifications
      summary: Update specification
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Specification'
      responses:
        "200":
          description: Updated
    delete:
      tags:
        - Specifications
      summary: Soft delete specification
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
          description: Deleted
  /api/v1/specifications/variant/{variantId}:
    get:
      tags:
        - Specifications
      summary: Get specification by variant ID
      parameters:
        - in: path
          name: variantId
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
`;

  swaggerDoc += pathsAddition;
  fs.writeFileSync(swaggerPath, swaggerDoc);
  console.log('Swagger specs updated');
} else {
  console.log('Swagger specs already updated');
}
