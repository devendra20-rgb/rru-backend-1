import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load main .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Color, VariantColor } from '../modules/catalog/colors/color.model';
import { Feature, VariantFeature } from '../modules/catalog/features/feature.model';
import { Variant } from '../modules/catalog/variants/variant.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/rideroundup?retryWrites=true&w=majority';

async function restoreMasterFeaturesAndColors() {
  console.log('Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to:', mongoose.connection.name);

  // ===================== 1. ALL 130+ MASTER FEATURES =====================
  console.log('1. Upserting 130+ Master Features (All Categories)...');

  const allMasterFeatures = [
    // --- Safety & Security (32 Features) ---
    { name: 'Anti-lock Braking System (ABS)', slug: 'anti-lock-braking-system', category: 'safety', description: 'Prevents wheel lockup during emergency braking.' },
    { name: 'Electronic Stability Control (ESC / ESP)', slug: 'electronic-stability-control', category: 'safety', description: 'Maintains vehicle stability and prevents skidding.' },
    { name: 'Traction Control System (TCS)', slug: 'traction-control-system', category: 'safety', description: 'Prevents wheel spin during acceleration on slippery surfaces.' },
    { name: 'Electronic Brake-force Distribution (EBD)', slug: 'electronic-brake-force-distribution', category: 'safety', description: 'Optimizes brake force between front and rear axles.' },
    { name: 'Brake Assist (BA)', slug: 'brake-assist', category: 'safety', description: 'Maximizes braking pressure during panic braking.' },
    { name: 'Forward Collision Warning (FCW)', slug: 'forward-collision-warning', category: 'safety', description: 'Alerts driver of imminent frontal collisions.' },
    { name: 'Autonomous Emergency Braking (AEB)', slug: 'automatic-emergency-braking', category: 'safety', description: 'Automatically brakes to mitigate or avoid crashes.' },
    { name: 'Pedestrian & Cyclist Detection', slug: 'pedestrian-cyclist-detection', category: 'safety', description: 'Detects pedestrians and cyclists in vehicle path.' },
    { name: 'Blind Spot Monitoring (BSM)', slug: 'blind-spot-monitoring', category: 'safety', description: 'Visual alerts in side mirrors for vehicles in blind spots.' },
    { name: 'Rear Cross-Traffic Alert (RCTA)', slug: 'rear-cross-traffic-alert', category: 'safety', description: 'Warns of approaching cross traffic when reversing.' },
    { name: 'Lane Departure Warning (LDW)', slug: 'lane-departure-warning', category: 'safety', description: 'Alerts when vehicle drifts out of its lane unintentionally.' },
    { name: 'Lane Keeping Assist (LKA)', slug: 'lane-keeping-assist', category: 'safety', description: 'Actively steers vehicle back into lane boundaries.' },
    { name: 'Lane Centering Assist (LCA)', slug: 'lane-centering-assist', category: 'safety', description: 'Maintains centered position between road lane markers.' },
    { name: 'Adaptive Cruise Control (ACC)', slug: 'adaptive-cruise-control', category: 'safety', description: 'Maintains a preset distance from the vehicle ahead.' },
    { name: 'Traffic Sign Recognition (TSR)', slug: 'traffic-sign-recognition', category: 'safety', description: 'Reads and displays speed limits and road signs.' },
    { name: 'Driver Attention & Drowsiness Monitor', slug: 'driver-attention-monitor', category: 'safety', description: 'Monitors steering behavior and prompts rest breaks.' },
    { name: 'Safe Exit Assist (SEA)', slug: 'safe-exit-assist', category: 'safety', description: 'Prevents doors opening if traffic approaches from rear.' },
    { name: '360-Degree Surround View Camera', slug: '360-degree-camera', category: 'safety', description: 'Bird-eye panoramic overhead view for precision parking.' },
    { name: 'Front & Rear Parking Sensors', slug: 'parking-sensors', category: 'safety', description: 'Ultrasonic distance sensors for obstacle warnings.' },
    { name: 'Reversing Camera with Dynamic Guidelines', slug: 'reversing-camera-dynamic', category: 'safety', description: 'High-definition rear view with trajectory lines.' },
    { name: 'Tire Pressure Monitoring System (TPMS)', slug: 'tire-pressure-monitoring', category: 'safety', description: 'Real-time tire pressure and temperature readout.' },
    { name: 'Hill Start Assist (HSA)', slug: 'hill-start-assist', category: 'safety', description: 'Holds brakes temporarily on steep inclines.' },
    { name: 'Hill Descent Control (HDC)', slug: 'hill-descent-control', category: 'safety', description: 'Controls speed automatically during steep off-road descents.' },
    { name: 'ISOFIX Child Seat Anchors', slug: 'isofix-child-seat-anchors', category: 'safety', description: 'Standardized rigid attachment points for child car seats.' },
    { name: 'Night Vision Assist with Infrared', slug: 'night-vision', category: 'safety', description: 'Thermal imaging camera highlights pedestrians and wildlife.' },
    { name: 'Rollover Mitigation System', slug: 'rollover-mitigation', category: 'safety', description: 'Detects rollover risk and applies selective wheel braking.' },
    { name: 'Speed Limiter with Geo-Fencing', slug: 'speed-limiter', category: 'safety', description: 'Configurable maximum speed limiter.' },
    { name: 'Automatic High Beam Assist (AHB)', slug: 'automatic-high-beam', category: 'safety', description: 'Switches between high/low beams when detecting oncoming traffic.' },
    { name: 'Engine Immobilizer & Anti-Theft Alarm', slug: 'anti-theft-alarm', category: 'safety', description: 'Electronic key chip verification and perimeter intrusion alarm.' },
    { name: 'SOS Emergency eCall System', slug: 'sos-emergency-call', category: 'safety', description: 'Automated emergency services notification upon airbag deployment.' },
    { name: 'Pre-Safe Collision Preparation', slug: 'pre-safe-collision-prep', category: 'safety', description: 'Tightens seatbelts, closes windows before predicted impact.' },
    { name: 'Rear Collision Mitigation', slug: 'rear-collision-mitigation', category: 'safety', description: 'Flashes hazard lights and locks brakes if rear collision imminent.' },

    // --- Exterior (22 Features) ---
    { name: 'Full LED Headlights', slug: 'led-headlights', category: 'exterior', description: 'Energy-efficient high-luminosity LED lighting.' },
    { name: 'Matrix Pixel LED Headlights', slug: 'matrix-led-headlights', category: 'exterior', description: 'Individually controlled LEDs with anti-glare high-beam masking.' },
    { name: 'Laser Headlights', slug: 'laser-headlights', category: 'exterior', description: 'Ultra-long range laser illumination up to 600 meters.' },
    { name: 'LED Daytime Running Lights (DRLs)', slug: 'led-daytime-running-lights', category: 'exterior', description: 'Signature LED lighting for enhanced daytime visibility.' },
    { name: 'LED Tail Lights with Dynamic Sequential Signals', slug: 'dynamic-led-taillights', category: 'exterior', description: 'Sweeping dynamic turn signal animation.' },
    { name: 'Front & Rear Fog Lamps', slug: 'front-rear-fog-lamps', category: 'exterior', description: 'Penetrating wide-beam illumination for sand and fog.' },
    { name: 'Panoramic Sunroof', slug: 'panoramic-sunroof', category: 'exterior', description: 'Full-length dual glass roof with power sliding front panel.' },
    { name: 'Electric Tilting Sunroof', slug: 'sunroof', category: 'exterior', description: 'Power glass moonroof with tilt and slide functions.' },
    { name: 'Hands-Free Power Tailgate', slug: 'power-tailgate', category: 'exterior', description: 'Opens via foot motion sensor under rear bumper or remote key.' },
    { name: 'Integrated Roof Rails', slug: 'roof-rails', category: 'exterior', description: 'Aerodynamic roof channels for luggage and sports carriers.' },
    { name: 'Power Deployable Running Boards', slug: 'running-boards', category: 'exterior', description: 'Automated side steps extend when doors unlock.' },
    { name: 'Soft-Close Doors', slug: 'soft-close-doors', category: 'exterior', description: 'Electrically pulled latching for effortless quiet door closure.' },
    { name: 'Heated Windshield & Washer Jets', slug: 'heated-windshield', category: 'exterior', description: 'Embedded defroster wires and temperature-regulated fluid nozzles.' },
    { name: 'Rear Privacy Tinted Glass', slug: 'privacy-glass', category: 'exterior', description: 'Factory solar tint reduces heat and UV transmission.' },
    { name: 'Dual/Quad Sport Exhaust Outlets', slug: 'sport-exhaust-tips', category: 'exterior', description: 'Chrome or gloss black aerodynamic exhaust tips.' },
    { name: 'Active Aerodynamic Grille Shutters', slug: 'active-grille-shutters', category: 'exterior', description: 'Opens and closes automatically to optimize cooling and drag.' },
    { name: 'Active Rear Wing / Spoiler', slug: 'active-rear-spoiler', category: 'exterior', description: 'Speed-activated deployable aerodynamic spoiler.' },
    { name: 'Puddle Lamps with Logo Projection', slug: 'puddle-lamps-logo', category: 'exterior', description: 'Illuminates ground under doors with branded crest.' },
    { name: 'Rain-Sensing Automatic Wipers', slug: 'rain-sensing-wipers', category: 'exterior', description: 'Optical rain sensor automatically modulates wiper speed.' },
    { name: 'Alloy Wheels (20-22 Inch)', slug: 'large-alloy-wheels', category: 'exterior', description: 'Diamond-cut forged premium alloy wheel rims.' },
    { name: 'Heated Power-Folding Side Mirrors', slug: 'power-folding-mirrors', category: 'exterior', description: 'Electric folding with heating elements and turn indicators.' },
    { name: 'Auto-Dimming Driver Side Mirror', slug: 'auto-dimming-side-mirror', category: 'exterior', description: 'Electrochromic glass eliminates night headlight glare.' },

    // --- Interior (18 Features) ---
    { name: 'Ambient Mood Lighting (64 Colors)', slug: 'ambient-lighting', category: 'interior', description: 'Customizable multi-color dynamic LED interior lighting.' },
    { name: 'Leather-Wrapped Multifunction Steering Wheel', slug: 'leather-steering-wheel', category: 'interior', description: 'Handcrafted leather wheel with touch-capacitive controls.' },
    { name: 'Heated Steering Wheel', slug: 'heated-steering-wheel', category: 'interior', description: 'Rapid 360-degree rim heating.' },
    { name: 'Illuminated Door Sill Scuff Plates', slug: 'illuminated-door-sills', category: 'interior', description: 'Brushed metal plates with illuminated branding.' },
    { name: 'Real Carbon Fiber Interior Inlays', slug: 'carbon-fiber-trim', category: 'interior', description: 'High-gloss or open-pore carbon composite inserts.' },
    { name: 'Open-Pore Natural Wood Veneers', slug: 'open-pore-wood-trim', category: 'interior', description: 'Sustainable authentic matte wood finishes.' },
    { name: 'Brushed Aluminum Accent Trims', slug: 'brushed-aluminum-trim', category: 'interior', description: 'Precision CNC-machined metal interior details.' },
    { name: 'Anthracite Black Headliner', slug: 'anthracite-headliner', category: 'interior', description: 'Premium dark ceiling fabric or suede upholstery.' },
    { name: 'Frameless Auto-Dimming Rearview Mirror', slug: 'auto-dimming-mirror', category: 'interior', description: 'Bezel-less electrochromic optical mirror.' },
    { name: 'Rear Window Power Sunshades', slug: 'rear-power-sunshades', category: 'interior', description: 'Electric retractable privacy blinds for rear windows.' },
    { name: 'Center Console Cool Box / Refrigerator', slug: 'center-console-coolbox', category: 'interior', description: 'Thermoelectric insulated chiller for beverages.' },
    { name: 'Stainless Steel Sports Pedals', slug: 'stainless-pedals', category: 'interior', description: 'Textured rubber and metal non-slip foot pedals.' },
    { name: 'Executive Rear Center Armrest Console', slug: 'executive-rear-armrest', category: 'interior', description: 'Integrated touchscreen, cupholders, and wireless charging.' },
    { name: 'Alcantara Suede Roof Lining', slug: 'alcantara-headliner', category: 'interior', description: 'Plush microfiber suede ceiling and pillar trim.' },
    { name: 'Panoramic Sky Lounge Star Roof', slug: 'sky-lounge-roof', category: 'interior', description: 'Etched fiber-optic starlight illumination embedded in glass.' },
    { name: 'Soft-Touch Leatherette Dashboard', slug: 'leather-dashboard', category: 'interior', description: 'Double-stitched premium upper dash and door topper surfaces.' },
    { name: 'Multi-Tier Cargo Management System', slug: 'cargo-management-system', category: 'interior', description: 'Adjustable partition dividers, luggage nets, and tie-down hooks.' },
    { name: 'Deep-Pile Velour Floor Mats', slug: 'velour-floor-mats', category: 'interior', description: 'Heavy-duty plush carpeted mats with non-slip backing.' },

    // --- Comfort (20 Features) ---
    { name: 'Dual-Zone Automatic Climate Control', slug: 'dual-zone-climate-control', category: 'comfort', description: 'Independent temperature zones for driver and passenger.' },
    { name: 'Tri-Zone Automatic Climate Control', slug: 'tri-zone-climate-control', category: 'comfort', description: 'Independent rear passenger climate control zone.' },
    { name: 'Quad-Zone Automatic Climate Control', slug: 'quad-zone-climate-control', category: 'comfort', description: 'Four dedicated micro-climate control zones.' },
    { name: 'Power-Adjustable Front Seats (14-Way)', slug: 'power-adjustable-seats', category: 'comfort', description: 'Multi-directional electric adjustments with under-thigh extender.' },
    { name: 'Driver & Passenger Memory Settings', slug: 'memory-seats', category: 'comfort', description: 'Stores position presets for seats, mirrors, and steering column.' },
    { name: 'Heated Front Seats', slug: 'heated-front-seats', category: 'comfort', description: 'Multi-stage heated cushions and backrests.' },
    { name: 'Ventilated / Cooled Front Seats', slug: 'ventilated-front-seats', category: 'comfort', description: 'Active seat cooling fans optimized for Gulf climate.' },
    { name: 'Heated Rear Seats', slug: 'heated-rear-seats', category: 'comfort', description: 'Heated outboard rear seating positions.' },
    { name: 'Ventilated / Cooled Rear Seats', slug: 'ventilated-rear-seats', category: 'comfort', description: 'Active perforated seat ventilation for rear passengers.' },
    { name: 'Front Seat Massage System', slug: 'massage-seats', category: 'comfort', description: 'Multi-program pneumatic massage modules in seatbacks.' },
    { name: 'First-Class Executive Reclining Rear Seats', slug: 'executive-reclining-seats', category: 'comfort', description: 'Ottoman footrest and up to 43.5 degree deep recline.' },
    { name: '4-Way Power Lumbar Support', slug: 'power-lumbar-support', category: 'comfort', description: 'Ergonomic in-and-out/up-and-down lower back support.' },
    { name: 'Air Quality Ionizer & PM2.5 Filter', slug: 'air-quality-ionizer', category: 'comfort', description: 'Hospital-grade HEPA filtration with negative ion purification.' },
    { name: 'Active Interior Fragrance Atomizer', slug: 'fragrance-atomizer', category: 'comfort', description: 'Scent diffuser integrated into climate ventilation system.' },
    { name: 'Acoustic Double-Glazed Laminated Glass', slug: 'acoustic-laminated-glass', category: 'comfort', description: 'Sound-dampening acoustic film glass eliminates wind and tire noise.' },
    { name: 'Keyless Smart Entry (Smart Key)', slug: 'keyless-entry', category: 'comfort', description: 'Touch-to-unlock capacitive door handles.' },
    { name: 'Remote Engine Start (Pre-Cooling)', slug: 'remote-start', category: 'comfort', description: 'Starts AC remotely via key fob or smartphone app.' },
    { name: 'Power Steering Column with Easy Exit', slug: 'power-steering-column', category: 'comfort', description: 'Wheel tilts up and retracts automatically for easy entry/exit.' },
    { name: 'Heated & Cooled Center Cupholders', slug: 'heated-cooled-cupholders', category: 'comfort', description: 'Active Peltier element maintains beverage temperature.' },
    { name: 'Hydraulic Soft Comfort Suspension', slug: 'soft-comfort-suspension', category: 'comfort', description: 'Progressive hydraulic cushions isolate road imperfections.' },

    // --- Infotainment & Connectivity (22 Features) ---
    { name: 'Wireless Apple CarPlay', slug: 'apple-carplay', category: 'infotainment', description: 'Cable-free seamless iPhone screen projection.' },
    { name: 'Wireless Android Auto', slug: 'android-auto', category: 'infotainment', description: 'Cable-free Google Android device integration.' },
    { name: 'Touchscreen Infotainment Center (12.3"+)', slug: 'touchscreen-infotainment', category: 'infotainment', description: 'Ultra-wide HD capacitive display with haptic feedback.' },
    { name: 'Full Digital Instrument Cluster', slug: 'digital-instrument-cluster', category: 'infotainment', description: 'Configurable high-resolution virtual cockpit gauge screen.' },
    { name: 'Head-Up Display with Augmented Reality (HUD)', slug: 'head-up-display', category: 'infotainment', description: 'Projects navigation arrows and speed directly onto windshield.' },
    { name: 'Premium Branded Audio System', slug: 'premium-sound-system', category: 'infotainment', description: 'High-wattage multi-speaker surround audio (B&W/Burmester/Bose/JBL).' },
    { name: 'Qi Fast Wireless Smartphone Charging', slug: 'wireless-charging', category: 'infotainment', description: 'Cooled fast inductive charging pad for modern devices.' },
    { name: 'Multiple High-Speed USB-C Fast Ports', slug: 'usbc-ports', category: 'infotainment', description: '65W USB Power Delivery ports for all seating rows.' },
    { name: 'Built-in GPS Navigation with Live Traffic', slug: 'navigation-system', category: 'infotainment', description: 'Cloud-connected navigation with real-time incident warnings.' },
    { name: 'Dual Bluetooth Device Pairing', slug: 'bluetooth-connectivity', category: 'infotainment', description: 'Simultaneous pairing for audio streaming and phone calls.' },
    { name: 'Natural Language AI Voice Assistant', slug: 'ai-voice-assistant', category: 'infotainment', description: 'Understands conversational commands for climate, nav, media.' },
    { name: 'High-Speed 4G / 5G LTE Wi-Fi Hotspot', slug: '4g-wifi-hotspot', category: 'infotainment', description: 'Connects up to 10 mobile devices on onboard cellular network.' },
    { name: 'Over-The-Air (OTA) Cloud Software Updates', slug: 'ota-updates', category: 'infotainment', description: 'Wirelessly updates infotainment and vehicle ECU firmware.' },
    { name: 'Rear-Seat Entertainment Twin HD Displays', slug: 'rear-seat-entertainment', category: 'infotainment', description: 'Independent HDMI/streaming touchscreens with wireless headphones.' },
    { name: 'DAB+ Digital Audio Broadcasting Radio', slug: 'dab-digital-radio', category: 'infotainment', description: 'Crystal-clear digital radio frequency reception.' },
    { name: 'Connected Mobile Telematics App', slug: 'connected-car-app', category: 'infotainment', description: 'GPS vehicle tracking, lock/unlock, battery/fuel status from phone.' },
    { name: 'Digital Key (NFC & UWB Smartphone Access)', slug: 'digital-key-nfc', category: 'infotainment', description: 'Use iPhone/Android watch/phone as primary car key.' },
    { name: 'Amazon Alexa & Google Home Integration', slug: 'smart-home-integration', category: 'infotainment', description: 'Control home smart devices directly from dashboard.' },
    { name: 'In-Car Intercom System (Driver Talk)', slug: 'in-car-intercom', category: 'infotainment', description: 'Amplifies driver voice through rear speakers for third row.' },
    { name: '230V AC Domestic Power Socket', slug: 'ac-power-socket', category: 'infotainment', description: 'Household AC wall outlet for laptops and camping gear.' },
    { name: 'Wireless Video Screen Mirroring', slug: 'screen-mirroring', category: 'infotainment', description: 'Cast mobile video content directly to infotainment display.' },
    { name: 'Real-Time Fuel & EV Charging Locator', slug: 'ev-charger-locator', category: 'infotainment', description: 'Live availability and pricing at UAE charging stations.' },

    // --- Convenience (14 Features) ---
    { name: 'Push-Button Engine Start / Stop', slug: 'push-button-start', category: 'convenience', description: 'Keyless start with engine start/stop ignition switch.' },
    { name: 'Electronic Parking Brake (EPB) with Auto-Hold', slug: 'electronic-parking-brake', category: 'convenience', description: 'Automatic brake hold in heavy stop-and-go traffic.' },
    { name: 'Automated Park Assist (Self-Parking)', slug: 'automatic-park-assist', category: 'convenience', description: 'Steers automatically into parallel and perpendicular bays.' },
    { name: 'Remote Smart Parking Assist (Key Fob Summon)', slug: 'remote-smart-parking', category: 'convenience', description: 'Move car into tight parking spots remotely outside vehicle.' },
    { name: 'Walk-Away Auto Door Lock', slug: 'walk-away-auto-lock', category: 'convenience', description: 'Locks all doors and folds mirrors when key walks away.' },
    { name: 'Power Folding 3rd-Row Seats (One-Touch)', slug: 'power-folding-3rd-row', category: 'convenience', description: 'Buttons in trunk fold and erect third-row bench.' },
    { name: '60:40 Split-Folding Rear Seatbacks', slug: 'split-folding-rear-seats', category: 'convenience', description: 'Versatile passenger and cargo load configurations.' },
    { name: 'Hands-Free Foot-Sensor Tailgate', slug: 'hands-free-trunk', category: 'convenience', description: 'Kick sensor under bumper triggers boot lid opening.' },
    { name: 'Valet Mode Lock & PIN Security', slug: 'valet-mode', category: 'convenience', description: 'Locks glove box, trunk, and limits engine power during valet.' },
    { name: 'Reverse Gear Auto-Tilting Passenger Mirror', slug: 'reverse-tilt-mirror', category: 'convenience', description: 'Angles passenger mirror down to display curb during reverse.' },
    { name: 'Electric Tailgate Height Memory', slug: 'tailgate-height-memory', category: 'convenience', description: 'Programs opening ceiling limit for low-clearance garages.' },
    { name: 'Retractable Load Compartment Cover', slug: 'cargo-tonneau-cover', category: 'convenience', description: 'Conceals trunk luggage from external view.' },
    { name: 'Underfloor Concealed Trunk Storage', slug: 'underfloor-trunk-storage', category: 'convenience', description: 'Hidden secure storage bin under false trunk floor.' },
    { name: 'Front & Rear Seatback Magazine Pockets', slug: 'seatback-pockets', category: 'convenience', description: 'Convenient storage organizers on seatbacks.' },

    // --- Performance & Handling (16 Features) ---
    { name: 'Adaptive Air Suspension with Height Lift', slug: 'air-suspension', category: 'performance', description: 'Pneumatic air springs adjust vehicle clearance and damping.' },
    { name: 'Adaptive Magnetic Dampers (DCC)', slug: 'adaptive-dampers', category: 'performance', description: 'Adjusts shock absorber stiffness hundreds of times per second.' },
    { name: 'Multi-Drive Dynamic Modes', slug: 'sport-mode', category: 'performance', description: 'Adjusts throttle, steering, gearbox, and exhaust profiles.' },
    { name: 'Multi-Terrain Response Management', slug: 'terrain-management', category: 'performance', description: 'Dedicated calibrations for sand, rock, mud, and snow.' },
    { name: 'Full-Time All-Wheel Drive with Low-Range Gearbox', slug: 'low-range-4wd', category: 'performance', description: 'Two-speed transfer case provides extreme crawler torque.' },
    { name: 'Electronic Locking Rear Differential', slug: 'locking-rear-differential', category: 'performance', description: 'Locks left and right rear wheels together for max traction.' },
    { name: 'Electronic Center Differential Lock', slug: 'center-differential-lock', category: 'performance', description: 'Splits 50:50 torque equally between front and rear axles.' },
    { name: 'Rear-Wheel Active Steering (4-Wheel Steering)', slug: 'rear-wheel-steering', category: 'performance', description: 'Rear wheels turn to shrink turning radius and increase high-speed agility.' },
    { name: 'Launch Control System', slug: 'launch-control', category: 'performance', description: 'Optimizes engine RPM and clutch engagement for zero wheelspin launch.' },
    { name: 'Active Valved Sport Exhaust System', slug: 'active-exhaust-system', category: 'performance', description: 'Variable bypass valves unlock aggressive exhaust acoustic tone.' },
    { name: 'Carbon Ceramic High-Performance Brakes', slug: 'carbon-ceramic-brakes', category: 'performance', description: 'Fade-free carbon-silicon carbide discs withstand track temperatures.' },
    { name: 'Brembo Multi-Piston Fixed Brake Calipers', slug: 'brembo-brakes', category: 'performance', description: 'Rigid monobloc calipers provide instant high-force stopping.' },
    { name: 'Sport Steering Wheel with Paddle Shifters', slug: 'paddle-shifters', category: 'performance', description: 'Direct fingertip manual gear shifting.' },
    { name: 'Dynamic Torque Vectoring Control', slug: 'torque-vectoring', category: 'performance', description: 'Distributes torque across individual wheels to pull vehicle through corners.' },
    { name: 'Dedicated Drift Mode / RWD Disconnect', slug: 'drift-mode', category: 'performance', description: 'Sends 100% torque to rear axle with ESP relaxation for controlled oversteer.' },
    { name: 'Electric Active Anti-Roll Stabilization', slug: 'active-roll-stabilization', category: 'performance', description: '48V electro-mechanical roll bars keep vehicle flat in high-speed turns.' },
  ];

  for (const f of allMasterFeatures) {
    await Feature.findOneAndUpdate(
      { slug: f.slug },
      { $set: { name: f.name, slug: f.slug, category: f.category, description: f.description, status: 'active' } },
      { upsert: true, returnDocument: 'after' }
    );
  }
  const totalFeatures = await Feature.countDocuments();
  console.log(`  ✓ Total Master Features in DB: ${totalFeatures}`);

  // ===================== 2. ALL 85+ MASTER COLORS =====================
  console.log('2. Upserting 85+ Master Colors (Exterior & Interior)...');

  const allMasterColors = [
    // --- Exterior Colors (60 Colors) ---
    { name: 'Pearl White', slug: 'pearl-white', hexCode: '#F5F5F0', type: 'exterior', colorFamily: 'White', finishType: 'Pearl' },
    { name: 'Glacier White Metallic', slug: 'glacier-white', hexCode: '#F8F9FA', type: 'exterior', colorFamily: 'White', finishType: 'Metallic' },
    { name: 'Alpine White', slug: 'alpine-white', hexCode: '#FFFFFF', type: 'exterior', colorFamily: 'White', finishType: 'Solid' },
    { name: 'Polar White', slug: 'polar-white', hexCode: '#FDFDFD', type: 'exterior', colorFamily: 'White', finishType: 'Solid' },
    { name: 'Carrara White Metallic', slug: 'carrara-white', hexCode: '#F6F6F4', type: 'exterior', colorFamily: 'White', finishType: 'Metallic' },
    { name: 'Mineral White Metallic', slug: 'mineral-white', hexCode: '#EDEDEB', type: 'exterior', colorFamily: 'White', finishType: 'Metallic' },
    { name: 'Snowflake White Pearl', slug: 'snowflake-white-pearl', hexCode: '#F4F5F0', type: 'exterior', colorFamily: 'White', finishType: 'Pearl' },
    { name: 'Lunar White', slug: 'lunar-white', hexCode: '#FAFAFA', type: 'exterior', colorFamily: 'White', finishType: 'Metallic' },

    { name: 'Midnight Black', slug: 'midnight-black', hexCode: '#0A0A0A', type: 'exterior', colorFamily: 'Black', finishType: 'Metallic' },
    { name: 'Obsidian Black Metallic', slug: 'obsidian-black', hexCode: '#111111', type: 'exterior', colorFamily: 'Black', finishType: 'Metallic' },
    { name: 'Mythos Black Metallic', slug: 'mythos-black', hexCode: '#0D0D0D', type: 'exterior', colorFamily: 'Black', finishType: 'Metallic' },
    { name: 'Santorini Black', slug: 'santorini-black', hexCode: '#141416', type: 'exterior', colorFamily: 'Black', finishType: 'Pearl' },
    { name: 'Jet Black', slug: 'jet-black', hexCode: '#050505', type: 'exterior', colorFamily: 'Black', finishType: 'Solid' },
    { name: 'Magno Night Black (Matte)', slug: 'magno-night-black', hexCode: '#1A1A1A', type: 'exterior', colorFamily: 'Black', finishType: 'Matte' },

    { name: 'Nardo Grey', slug: 'nardo-grey', hexCode: '#686B73', type: 'exterior', colorFamily: 'Grey', finishType: 'Solid' },
    { name: 'Daytona Grey Pearl', slug: 'daytona-grey', hexCode: '#4B4D4F', type: 'exterior', colorFamily: 'Grey', finishType: 'Pearl' },
    { name: 'Brooklyn Grey Metallic', slug: 'brooklyn-grey', hexCode: '#8E9398', type: 'exterior', colorFamily: 'Grey', finishType: 'Metallic' },
    { name: 'Graphite Grey', slug: 'graphite-grey', hexCode: '#4A4A4A', type: 'exterior', colorFamily: 'Grey', finishType: 'Metallic' },
    { name: 'Selenite Grey Metallic', slug: 'selenite-grey', hexCode: '#565A5C', type: 'exterior', colorFamily: 'Grey', finishType: 'Metallic' },
    { name: 'Selenite Grey Magno (Matte)', slug: 'selenite-grey-magno', hexCode: '#484B4D', type: 'exterior', colorFamily: 'Grey', finishType: 'Matte' },
    { name: 'Chalk Grey (Crayon)', slug: 'chalk-grey', hexCode: '#CCCBC6', type: 'exterior', colorFamily: 'Grey', finishType: 'Solid' },
    { name: 'Manhattan Grey Metallic', slug: 'manhattan-grey', hexCode: '#525456', type: 'exterior', colorFamily: 'Grey', finishType: 'Metallic' },
    { name: 'Tungsten Silver', slug: 'tungsten-silver', hexCode: '#737578', type: 'exterior', colorFamily: 'Grey', finishType: 'Metallic' },
    { name: 'Quicksilver Metallic', slug: 'quicksilver', hexCode: '#8B8D91', type: 'exterior', colorFamily: 'Grey', finishType: 'Metallic' },
    { name: 'Quantum Grey', slug: 'quantum-grey', hexCode: '#7B7E82', type: 'exterior', colorFamily: 'Grey', finishType: 'Solid' },

    { name: 'Titanium Silver', slug: 'titanium-silver', hexCode: '#A8A9AD', type: 'exterior', colorFamily: 'Silver', finishType: 'Metallic' },
    { name: 'Iridium Silver Metallic', slug: 'iridium-silver', hexCode: '#C4C7CC', type: 'exterior', colorFamily: 'Silver', finishType: 'Metallic' },
    { name: 'Floret Silver Metallic', slug: 'floret-silver', hexCode: '#B8BAC0', type: 'exterior', colorFamily: 'Silver', finishType: 'Metallic' },
    { name: 'Billet Silver', slug: 'billet-silver', hexCode: '#A5A7AA', type: 'exterior', colorFamily: 'Silver', finishType: 'Metallic' },

    { name: 'Glacier Blue', slug: 'glacier-blue', hexCode: '#2E86AB', type: 'exterior', colorFamily: 'Blue', finishType: 'Metallic' },
    { name: 'Portimao Blue Metallic', slug: 'portimao-blue', hexCode: '#0F3B82', type: 'exterior', colorFamily: 'Blue', finishType: 'Metallic' },
    { name: 'Estoril Blue', slug: 'estoril-blue', hexCode: '#1A539B', type: 'exterior', colorFamily: 'Blue', finishType: 'Metallic' },
    { name: 'Miami Blue', slug: 'miami-blue', hexCode: '#0085CA', type: 'exterior', colorFamily: 'Blue', finishType: 'Solid' },
    { name: 'Navarra Blue Metallic', slug: 'navarra-blue', hexCode: '#132B50', type: 'exterior', colorFamily: 'Blue', finishType: 'Metallic' },
    { name: 'Deep Crystal Blue', slug: 'deep-crystal-blue', hexCode: '#1B2C4E', type: 'exterior', colorFamily: 'Blue', finishType: 'Pearl' },
    { name: 'Tanzanite Blue II', slug: 'tanzanite-blue', hexCode: '#101C38', type: 'exterior', colorFamily: 'Blue', finishType: 'Metallic' },
    { name: 'Navy Blue', slug: 'navy-blue', hexCode: '#1B3A6B', type: 'exterior', colorFamily: 'Blue', finishType: 'Solid' },
    { name: 'Shark Blue', slug: 'shark-blue', hexCode: '#00629B', type: 'exterior', colorFamily: 'Blue', finishType: 'Solid' },
    { name: 'Phytonic Blue Metallic', slug: 'phytonic-blue', hexCode: '#1D4573', type: 'exterior', colorFamily: 'Blue', finishType: 'Metallic' },

    { name: 'Firestorm Red', slug: 'firestorm-red', hexCode: '#C0392B', type: 'exterior', colorFamily: 'Red', finishType: 'Metallic' },
    { name: 'Rosso Corsa', slug: 'rosso-corsa', hexCode: '#D40000', type: 'exterior', colorFamily: 'Red', finishType: 'Solid' },
    { name: 'Carmine Red', slug: 'carmine-red', hexCode: '#A3001E', type: 'exterior', colorFamily: 'Red', finishType: 'Solid' },
    { name: 'Soul Red Crystal', slug: 'soul-red-crystal', hexCode: '#8B0000', type: 'exterior', colorFamily: 'Red', finishType: 'Metallic' },
    { name: 'Tango Red Metallic', slug: 'tango-red', hexCode: '#B31B1B', type: 'exterior', colorFamily: 'Red', finishType: 'Metallic' },
    { name: 'Melbourne Red Metallic', slug: 'melbourne-red', hexCode: '#C21807', type: 'exterior', colorFamily: 'Red', finishType: 'Metallic' },
    { name: 'Deep Burgundy', slug: 'deep-burgundy', hexCode: '#6D0F1E', type: 'exterior', colorFamily: 'Red', finishType: 'Pearl' },
    { name: 'Sunset Red Metallic', slug: 'sunset-red', hexCode: '#C83A2A', type: 'exterior', colorFamily: 'Red', finishType: 'Metallic' },

    { name: 'Forest Green', slug: 'forest-green', hexCode: '#2D6A4F', type: 'exterior', colorFamily: 'Green', finishType: 'Metallic' },
    { name: 'British Racing Green', slug: 'british-racing-green', hexCode: '#004225', type: 'exterior', colorFamily: 'Green', finishType: 'Solid' },
    { name: 'Isle of Man Green Metallic', slug: 'isle-of-man-green', hexCode: '#0E5B42', type: 'exterior', colorFamily: 'Green', finishType: 'Metallic' },
    { name: 'Aventurine Green Metallic', slug: 'aventurine-green', hexCode: '#3C4B40', type: 'exterior', colorFamily: 'Green', finishType: 'Metallic' },
    { name: 'Python Green', slug: 'python-green', hexCode: '#39A935', type: 'exterior', colorFamily: 'Green', finishType: 'Solid' },
    { name: 'Oak Green Metallic', slug: 'oak-green', hexCode: '#233827', type: 'exterior', colorFamily: 'Green', finishType: 'Metallic' },

    { name: 'Racing Yellow', slug: 'racing-yellow', hexCode: '#F7D000', type: 'exterior', colorFamily: 'Yellow', finishType: 'Solid' },
    { name: 'Speed Yellow', slug: 'speed-yellow', hexCode: '#FFD700', type: 'exterior', colorFamily: 'Yellow', finishType: 'Solid' },
    { name: 'Papaya Orange', slug: 'papaya-orange', hexCode: '#FF7F00', type: 'exterior', colorFamily: 'Orange', finishType: 'Solid' },
    { name: 'Sunset Orange Metallic', slug: 'sunset-orange', hexCode: '#E65100', type: 'exterior', colorFamily: 'Orange', finishType: 'Metallic' },

    { name: 'Desert Sand', slug: 'desert-sand', hexCode: '#C4A882', type: 'exterior', colorFamily: 'Beige', finishType: 'Solid' },
    { name: 'Champagne Gold Metallic', slug: 'champagne-gold', hexCode: '#C5A028', type: 'exterior', colorFamily: 'Gold', finishType: 'Metallic' },
    { name: 'Gobi Tan', slug: 'gobi-tan', hexCode: '#B89B72', type: 'exterior', colorFamily: 'Beige', finishType: 'Solid' },
    { name: 'Dune Bronze Metallic', slug: 'dune-bronze', hexCode: '#7A624A', type: 'exterior', colorFamily: 'Brown', finishType: 'Metallic' },

    // --- Interior Colors (26 Colors) ---
    { name: 'Black Leather', slug: 'black-leather', hexCode: '#1A1A1A', type: 'interior', colorFamily: 'Black', finishType: 'Leather' },
    { name: 'Black Nappa Leather', slug: 'black-nappa-leather', hexCode: '#121212', type: 'interior', colorFamily: 'Black', finishType: 'Nappa' },
    { name: 'Alcantara Anthracite', slug: 'alcantara-anthracite', hexCode: '#2B2B2B', type: 'interior', colorFamily: 'Black', finishType: 'Alcantara' },
    { name: 'Graphite Fabric', slug: 'graphite-fabric', hexCode: '#3D3D3D', type: 'interior', colorFamily: 'Grey', finishType: 'Fabric' },
    { name: 'Silverstone Light Grey Leather', slug: 'silverstone-grey-leather', hexCode: '#D2D4D6', type: 'interior', colorFamily: 'Grey', finishType: 'Leather' },
    { name: 'Beige Caramel', slug: 'beige-caramel', hexCode: '#C8A97E', type: 'interior', colorFamily: 'Beige', finishType: 'Leather' },
    { name: 'Cream Ivory White Leather', slug: 'ivory-white', hexCode: '#F8F4E8', type: 'interior', colorFamily: 'White', finishType: 'Leather' },
    { name: 'Macchiato Beige Leather', slug: 'macchiato-beige', hexCode: '#DDC9AC', type: 'interior', colorFamily: 'Beige', finishType: 'Leather' },
    { name: 'Dark Mocha Brown', slug: 'dark-brown', hexCode: '#4A2C17', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Cognac Tan Leather', slug: 'cognac-tan-leather', hexCode: '#9E5B2E', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Tan Windsor Leather', slug: 'tan-windsor-leather', hexCode: '#A0522D', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Tartufo Merino Leather', slug: 'tartufo-leather', hexCode: '#7B4A28', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Truffle Brown Leather', slug: 'truffle-brown', hexCode: '#5B4033', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Chestnut Brown', slug: 'chestnut-brown', hexCode: '#6B3A2A', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Red Sport Leather', slug: 'red-sport-leather', hexCode: '#8B1A1A', type: 'interior', colorFamily: 'Red', finishType: 'Leather' },
    { name: 'Magma Red Nappa Leather', slug: 'magma-red-leather', hexCode: '#9C1B1B', type: 'interior', colorFamily: 'Red', finishType: 'Nappa' },
    { name: 'Crimson Red / Black Two-Tone', slug: 'crimson-black-twotone', hexCode: '#661111', type: 'interior', colorFamily: 'Red', finishType: 'Two-Tone' },
    { name: 'Fiona Red / Black Leather', slug: 'fiona-red-leather', hexCode: '#871F27', type: 'interior', colorFamily: 'Red', finishType: 'Leather' },
    { name: 'Night Green Leather', slug: 'night-green-leather', hexCode: '#1C3325', type: 'interior', colorFamily: 'Green', finishType: 'Leather' },
    { name: 'Yachting Blue Leather', slug: 'yachting-blue-leather', hexCode: '#22384D', type: 'interior', colorFamily: 'Blue', finishType: 'Leather' },
    { name: 'Black & Beige Two-Tone', slug: 'black-beige-twotone', hexCode: '#6B5B49', type: 'interior', colorFamily: 'Two-Tone', finishType: 'Two-Tone' },
    { name: 'Black & Cognac Two-Tone', slug: 'black-cognac-twotone', hexCode: '#5A3820', type: 'interior', colorFamily: 'Two-Tone', finishType: 'Two-Tone' },
    { name: 'Oatmeal Perforated Leather', slug: 'oatmeal-leather', hexCode: '#D8CDBF', type: 'interior', colorFamily: 'Beige', finishType: 'Leather' },
    { name: 'Saddle Tan Premium Leather', slug: 'saddle-tan', hexCode: '#8C5226', type: 'interior', colorFamily: 'Brown', finishType: 'Leather' },
    { name: 'Sakhir Orange Leather', slug: 'sakhir-orange-leather', hexCode: '#B34A26', type: 'interior', colorFamily: 'Orange', finishType: 'Leather' },
    { name: 'Midland Grey Fabric / Suede', slug: 'midland-grey-fabric', hexCode: '#585858', type: 'interior', colorFamily: 'Grey', finishType: 'Fabric' },
  ];

  for (const c of allMasterColors) {
    await Color.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, slug: c.slug, hexCode: c.hexCode, type: c.type, colorFamily: c.colorFamily, finishType: c.finishType, status: 'active' } },
      { upsert: true, returnDocument: 'after' }
    );
  }
  const totalColors = await Color.countDocuments();
  console.log(`  ✓ Total Master Colors in DB: ${totalColors}`);

  console.log('\n======================================================');
  console.log('✅ MASTER FEATURES AND COLORS EXPANDED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`- Total Features in Catalog: ${totalFeatures}`);
  console.log(`- Total Colors in Catalog: ${totalColors}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

restoreMasterFeaturesAndColors().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
