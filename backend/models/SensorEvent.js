/**
 * SensorEvent.js
 * Stores simulated or real IoT sensor readings from the farm.
 * These are the autonomous data inputs that FarmGuard AI monitors
 * without requiring any worker input.
 */
const mongoose = require('mongoose');

const sensorEventSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shed: { type: String },
    sensorType: {
      type: String,
      enum: [
        // Environmental
        'temperature', 'humidity', 'co2', 'ammonia', 'light',
        // Animal
        'animal_count', 'mortality_count', 'weight_sensor', 'water_consumption',
        // Feed/Inventory
        'feed_consumption', 'feed_bin_level', 'medicine_dispensed',
        // Access
        'rfid_attendance', 'rfid_animal', 'camera_visitor', 'anpr_vehicle',
        // Biosecurity
        'footbath_sensor', 'ppe_detector', 'gate_sensor',
      ],
      required: true,
    },
    value: { type: Number, required: true },
    unit: { type: String }, // kg, °C, %, count, etc.
    source: {
      type: String,
      enum: ['iot_device', 'rfid_reader', 'camera', 'manual', 'simulated'],
      default: 'simulated',
    },
    deviceId: { type: String }, // hardware device identifier
    isAnomaly: { type: Boolean, default: false },
    processedByAgent: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

sensorEventSchema.index({ farm: 1, sensorType: 1, createdAt: -1 });
sensorEventSchema.index({ farm: 1, processedByAgent: 1 });

module.exports = mongoose.model('SensorEvent', sensorEventSchema);
