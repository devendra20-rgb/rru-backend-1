
Project RideRoundUp {
  database_type: "MongoDB (conceptual)"
  Note: "MongoDB-native logical architecture. DBML is used only to visualize collections and references in dbdiagram.io."
}

Table brands {
  _id objectid [pk]
  brandCode varchar [unique, not null]
  name varchar [not null]
  slug varchar [unique, not null]
  originCountryCode varchar
  logoMediaId objectid
  status varchar [not null]
  createdAt datetime
  updatedAt datetime
}

Table markets {
  _id objectid [pk]
  marketCode varchar [unique, not null]
  countryCode varchar [not null]
  name varchar [not null]
  currencyCode varchar [not null]
  locale varchar
  timezone varchar
  isActive boolean
}

Table models {
  _id objectid [pk]
  brandId objectid [not null]
  modelCode varchar [unique, not null]
  name varchar [not null]
  slug varchar [unique, not null]
  bodyType varchar
  segment varchar
  launchYear int
  status varchar [not null]
  createdAt datetime
  updatedAt datetime
}

Table generations {
  _id objectid [pk]
  modelId objectid [not null]
  generationCode varchar [unique, not null]
  name varchar [not null]
  generationNumber int
  startYear int
  endYear int
  status varchar
}

Table variants {
  _id objectid [pk]
  modelId objectid [not null]
  generationId objectid
  variantCode varchar [unique, not null]
  name varchar [not null]
  slug varchar
  modelYearStart int
  modelYearEnd int
  fuelType varchar
  transmission varchar
  drivetrain varchar
  seats int
  doors int
  engine json
  performance json
  dimensions json
  ev json
  fuelConsumption json
  specifications json
  useCases varchar
  featureIds varchar
  status varchar [not null]
  createdAt datetime
  updatedAt datetime
}

Table variantMarkets {
  _id objectid [pk]
  variantId objectid [not null]
  marketId objectid [not null]
  marketVariantName varchar
  availability varchar [not null]
  launchDate date
  modelYear int
  warranty json
  pricing json
  colors json
  localizedContent json
  status varchar
  effectiveFrom date
  effectiveTo date
  createdAt datetime
  updatedAt datetime
  Note: "pricing and colors are embedded arrays in MongoDB; not separate SQL-style tables."
}

Table features {
  _id objectid [pk]
  featureCode varchar [unique, not null]
  category varchar [not null]
  name varchar [not null]
  description text
  status varchar
}

Table colors {
  _id objectid [pk]
  colorCode varchar [unique, not null]
  name varchar [not null]
  hex varchar
  colorFamily varchar
  status varchar
}

Table media {
  _id objectid [pk]
  mediaCode varchar [unique, not null]
  entityType varchar [not null]
  entityId objectid [not null]
  marketId objectid
  colorId objectid
  mediaType varchar [not null]
  angle varchar
  storageProvider varchar
  storagePath varchar
  cdnUrl varchar
  mimeType varchar
  width int
  height int
  checksum varchar
  sortOrder int
  isPrimary boolean
  altText varchar
  status varchar
  createdAt datetime
  updatedAt datetime
  Note: "Actual image/video files live in AWS S3; MongoDB stores metadata."
}

Table ownershipProfiles {
  _id objectid [pk]
  marketId objectid [not null]
  name varchar [not null]
  annualKm int
  ownershipYears int
  driverAge int
  insuranceProfile varchar
  fuelPrice decimal
  fuelPriceUpdatedAt datetime
}

Table ownershipCostConfigs {
  _id objectid [pk]
  marketId objectid [not null]
  costType varchar [not null]
  name varchar [not null]
  calculationMethod varchar [not null]
  defaultValue decimal
  unit varchar
  source varchar
  sourceUrl varchar
  effectiveFrom date
  effectiveTo date
}

Table depreciationCurves {
  _id objectid [pk]
  marketId objectid [not null]
  segment varchar
  bodyType varchar
  year1Percent decimal
  year2Percent decimal
  year3Percent decimal
  year4Percent decimal
  year5Percent decimal
  source varchar
  effectiveFrom date
  effectiveTo date
}

Table variantOwnershipOverrides {
  _id objectid [pk]
  variantMarketId objectid [not null]
  costType varchar [not null]
  value decimal
  unit varchar
  source varchar
  effectiveFrom date
  effectiveTo date
}

Table reviews {
  _id objectid [pk]
  variantId objectid [not null]
  marketId objectid
  userId objectid
  reviewType varchar [not null]
  title varchar
  body text
  ratings json
  verifiedOwner boolean
  status varchar [not null]
  publishedAt datetime
  createdAt datetime
  updatedAt datetime
}

Table users {
  _id objectid [pk]
  email varchar [unique, not null]
  phone varchar
  passwordHash varchar
  firstName varchar
  lastName varchar
  role varchar [not null]
  status varchar
  createdAt datetime
  updatedAt datetime
}

Table comparisons {
  _id objectid [pk]
  userId objectid
  marketId objectid
  variantIds varchar
  shareToken varchar [unique]
  showDifferencesOnly boolean
  createdAt datetime
  updatedAt datetime
}

Table savedVehicles {
  _id objectid [pk]
  userId objectid [not null]
  variantId objectid [not null]
  marketId objectid [not null]
  createdAt datetime
}

Table savedSearches {
  _id objectid [pk]
  userId objectid [not null]
  name varchar
  searchQuery varchar
  filters json
  marketId objectid
  alertsEnabled boolean
  createdAt datetime
  updatedAt datetime
}

Table userVehicles {
  _id objectid [pk]
  userId objectid [not null]
  variantId objectid
  marketId objectid
  registrationNumber varchar
  vin varchar
  nickname varchar
  purchaseDate date
  ownershipStatus varchar
  createdAt datetime
  updatedAt datetime
}

Table articles {
  _id objectid [pk]
  category varchar [not null]
  marketId objectid
  title varchar [not null]
  slug varchar [unique, not null]
  excerpt text
  body text
  heroMediaId objectid
  authorId objectid
  vehicleRefs json
  seo json
  status varchar [not null]
  publishedAt datetime
  createdAt datetime
  updatedAt datetime
}

Table aiConversations {
  _id objectid [pk]
  userId objectid
  marketId objectid
  title varchar
  status varchar
  createdAt datetime
  updatedAt datetime
}

Table aiMessages {
  _id objectid [pk]
  conversationId objectid [not null]
  role varchar [not null]
  content text
  assumptions json
  sourceData json
  recommendations json
  helpful boolean
  createdAt datetime
}

Table leads {
  _id objectid [pk]
  userId objectid
  marketId objectid
  variantId objectid
  leadType varchar [not null]
  name varchar
  email varchar
  phone varchar
  message text
  sourcePage varchar
  status varchar [not null]
  createdAt datetime
  updatedAt datetime
}

Table serviceBookings {
  _id objectid [pk]
  userId objectid
  marketId objectid [not null]
  userVehicleId objectid
  serviceType varchar [not null]
  location json
  preferredDate date
  preferredTime varchar
  status varchar [not null]
  notes text
  createdAt datetime
  updatedAt datetime
}

Table homepageConfigs {
  _id objectid [pk]
  marketId objectid [not null]
  sections json
  updatedAt datetime
  Note: "Homepage sections are embedded because one market homepage is read as one ordered configuration."
}

Table polls {
  _id objectid [pk]
  marketId objectid
  title varchar [not null]
  description text
  options json
  startsAt datetime
  endsAt datetime
  status varchar
}

Table pollVotes {
  _id objectid [pk]
  pollId objectid [not null]
  optionVariantId objectid [not null]
  userId objectid
  anonymousToken varchar
  createdAt datetime
}

Table importJobs {
  _id objectid [pk]
  fileName varchar
  fileType varchar
  source varchar
  uploadedBy objectid
  status varchar [not null]
  totalRows int
  successRows int
  failedRows int
  duplicateRows int
  warningRows int
  errorReportPath varchar
  startedAt datetime
  completedAt datetime
  createdAt datetime
}

Table importStagingRows {
  _id objectid [pk]
  importJobId objectid [not null]
  sheetName varchar
  rowNumber int
  rawData json
  normalizedData json
  validationStatus varchar
  errors json
  warnings json
  targetEntityType varchar
  targetEntityId objectid
  createdAt datetime
}

Table auditLogs {
  _id objectid [pk]
  userId objectid
  entityType varchar
  entityId objectid
  action varchar
  before json
  after json
  source varchar
  createdAt datetime
}

Ref: models.brandId > brands._id
Ref: generations.modelId > models._id
Ref: variants.modelId > models._id
Ref: variants.generationId > generations._id
Ref: variantMarkets.variantId > variants._id
Ref: variantMarkets.marketId > markets._id
Ref: variants.featureIds > features._id
Ref: variantMarkets._id > variantOwnershipOverrides.variantMarketId
Ref: media.marketId > markets._id
Ref: media.colorId > colors._id
Ref: reviews.variantId > variants._id
Ref: reviews.marketId > markets._id
Ref: reviews.userId > users._id
Ref: comparisons.userId > users._id
Ref: comparisons.marketId > markets._id
Ref: savedVehicles.userId > users._id
Ref: savedVehicles.variantId > variants._id
Ref: savedVehicles.marketId > markets._id
Ref: savedSearches.userId > users._id
Ref: savedSearches.marketId > markets._id
Ref: userVehicles.userId > users._id
Ref: userVehicles.variantId > variants._id
Ref: userVehicles.marketId > markets._id
Ref: articles.marketId > markets._id
Ref: articles.authorId > users._id
Ref: aiConversations.userId > users._id
Ref: aiConversations.marketId > markets._id
Ref: aiMessages.conversationId > aiConversations._id
Ref: leads.userId > users._id
Ref: leads.marketId > markets._id
Ref: leads.variantId > variants._id
Ref: serviceBookings.userId > users._id
Ref: serviceBookings.marketId > markets._id
Ref: serviceBookings.userVehicleId > userVehicles._id
Ref: polls.marketId > markets._id
Ref: pollVotes.pollId > polls._id
Ref: pollVotes.optionVariantId > variants._id
Ref: pollVotes.userId > users._id
Ref: importJobs.uploadedBy > users._id
Ref: importStagingRows.importJobId > importJobs._id
Ref: auditLogs.userId > users._id
