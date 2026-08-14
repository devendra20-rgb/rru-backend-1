const fs = require('fs');
const path = require('path');

const swaggerPath = path.join(__dirname, '../src/docs/swagger.yml');
let swaggerDoc = fs.readFileSync(swaggerPath, 'utf8');

if (!swaggerDoc.includes('Feature:')) {
  const componentsAddition = `
    Feature:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
        slug:
          type: string
        category:
          type: string
          enum: [safety, exterior, interior, comfort, infotainment, convenience, performance, other]
        description:
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

    VariantFeature:
      type: object
      properties:
        _id:
          type: string
        variantId:
          type: string
        featureId:
          type: string
        availability:
          type: string
          enum: [standard, optional, unavailable]
        value:
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
  /api/v1/features:
    get:
      tags:
        - Features
      summary: Get all features
      parameters:
        - in: query
          name: category
          schema:
            type: string
        - in: query
          name: search
          schema:
            type: string
        - in: query
          name: status
          schema:
            type: string
            enum: [active, inactive]
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
        '200':
          description: List of features
    post:
      tags:
        - Features
      summary: Create a feature
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                category:
                  type: string
                  enum: [safety, exterior, interior, comfort, infotainment, convenience, performance, other]
                description:
                  type: string
                status:
                  type: string
                  enum: [active, inactive]
      responses:
        '201':
          description: Feature created

  /api/v1/features/{id}:
    get:
      tags:
        - Features
      summary: Get feature by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Feature details
    patch:
      tags:
        - Features
      summary: Update feature
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
                name:
                  type: string
                category:
                  type: string
                description:
                  type: string
                status:
                  type: string
                  enum: [active, inactive]
      responses:
        '200':
          description: Feature updated
    delete:
      tags:
        - Features
      summary: Delete (deactivate) feature
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Feature deleted

  /api/v1/features/slug/{slug}:
    get:
      tags:
        - Features
      summary: Get feature by slug
      parameters:
        - in: path
          name: slug
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Feature details

  /api/v1/variant-features:
    get:
      tags:
        - Variant Features
      summary: Get all variant features
      parameters:
        - in: query
          name: variantId
          schema:
            type: string
        - in: query
          name: featureId
          schema:
            type: string
        - in: query
          name: status
          schema:
            type: string
            enum: [active, inactive]
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
        '200':
          description: List of variant features
    post:
      tags:
        - Variant Features
      summary: Map a feature to a variant
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                variantId:
                  type: string
                featureId:
                  type: string
                availability:
                  type: string
                  enum: [standard, optional, unavailable]
                value:
                  type: string
                status:
                  type: string
                  enum: [active, inactive]
      responses:
        '201':
          description: Variant feature mapped

  /api/v1/variant-features/{id}:
    get:
      tags:
        - Variant Features
      summary: Get variant feature mapping by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Variant feature mapping details
    patch:
      tags:
        - Variant Features
      summary: Update variant feature mapping
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
                availability:
                  type: string
                  enum: [standard, optional, unavailable]
                value:
                  type: string
                status:
                  type: string
                  enum: [active, inactive]
      responses:
        '200':
          description: Variant feature mapping updated
    delete:
      tags:
        - Variant Features
      summary: Delete (deactivate) variant feature mapping
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Variant feature mapping deleted

  /api/v1/variants/{variantId}/features:
    get:
      tags:
        - Variant Features
      summary: Get all features mapped to a specific variant
      parameters:
        - in: path
          name: variantId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of features mapped to variant
`;

  swaggerDoc = swaggerDoc.replace('paths:', 'paths:' + pathsAddition);
  fs.writeFileSync(swaggerPath, swaggerDoc);
  console.log('Swagger documentation updated with Feature schemas and routes.');
} else {
  console.log('Swagger documentation already contains Feature schemas and routes.');
}
