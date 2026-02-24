const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    education: {
      level: {
        type: String,
        enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'self_taught', 'bootcamp'],
        default: 'bachelor',
      },
      field: { type: String, trim: true, default: '' },
      institution: { type: String, trim: true, default: '' },
      graduationYear: { type: Number, default: null },
    },
    currentSkills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
      },
    ],
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ['student', 'entry', 'junior', 'mid', 'senior', 'lead'],
      default: 'entry',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },
    timeCommitmentHoursPerWeek: {
      type: Number,
      default: 10,
      min: 1,
      max: 80,
    },
    preferredLearningStyle: {
      type: String,
      enum: ['video', 'reading', 'hands_on', 'mixed'],
      default: 'mixed',
    },
    resumeText: {
      type: String,
      default: '',
      select: false,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
