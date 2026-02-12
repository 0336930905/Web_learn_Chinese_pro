/**
 * Validation Schemas
 * Input validation rules for API endpoints
 */

const { REGEX_PATTERNS } = require('../constants');

/**
 * Validation Rule Builder
 */
class ValidationSchema {
  constructor() {
    this.rules = {};
  }

  field(fieldName) {
    this.currentField = fieldName;
    this.rules[fieldName] = {
      validators: [],
      optional: false,
    };
    return this;
  }

  optional() {
    this.rules[this.currentField].optional = true;
    return this;
  }

  required(message = `${this.currentField} is required`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => value !== undefined && value !== null && value !== '',
      message,
    });
    return this;
  }

  string(message = `${this.currentField} must be a string`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => typeof value === 'string',
      message,
    });
    return this;
  }

  email(message = 'Email không hợp lệ') {
    this.rules[this.currentField].validators.push({
      validate: (value) => REGEX_PATTERNS.EMAIL.test(value),
      message,
    });
    return this;
  }

  min(length, message = `${this.currentField} must be at least ${length} characters`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => value && value.length >= length,
      message,
    });
    return this;
  }

  max(length, message = `${this.currentField} must be at most ${length} characters`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => !value || value.length <= length,
      message,
    });
    return this;
  }

  enum(values, message = `${this.currentField} must be one of: ${values.join(', ')}`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => values.includes(value),
      message,
    });
    return this;
  }

  objectId(message = `${this.currentField} must be a valid ObjectId`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => REGEX_PATTERNS.OBJECTID.test(value),
      message,
    });
    return this;
  }

  number(message = `${this.currentField} must be a number`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => !isNaN(Number(value)),
      message,
    });
    return this;
  }

  integer(message = `${this.currentField} must be an integer`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => Number.isInteger(Number(value)),
      message,
    });
    return this;
  }

  object(message = `${this.currentField} must be an object`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
      message,
    });
    return this;
  }

  positive(message = `${this.currentField} must be positive`) {
    this.rules[this.currentField].validators.push({
      validate: (value) => Number(value) > 0,
      message,
    });
    return this;
  }

  validate(data) {
    const errors = [];
    const validatedData = {};

    for (const [fieldName, rule] of Object.entries(this.rules)) {
      const value = data[fieldName];

      // Check if field is optional and not provided
      if (rule.optional && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Run validators
      for (const validator of rule.validators) {
        if (!validator.validate(value)) {
          errors.push({
            field: fieldName,
            message: validator.message,
          });
          break;
        }
      }

      if (errors.length === 0 || !errors.find(e => e.field === fieldName)) {
        validatedData[fieldName] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: validatedData,
    };
  }
}

/**
 * Auth Validators
 */
const authValidators = {
  register: () => {
    return new ValidationSchema()
      .field('email').required().string().email()
      .field('password').required().string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .field('fullName').optional().string()
      .field('role').optional().enum(['student', 'admin']);
  },

  login: () => {
    return new ValidationSchema()
      .field('email').required().string().email()
      .field('password').required().string();
  },

  updateProfile: () => {
    const schema = new ValidationSchema()
      .field('fullName').optional().string()
      .field('avatar').optional().string()
      .field('settings').optional().object();
    
    // Custom validation for settings structure
    const originalValidate = schema.validate.bind(schema);
    schema.validate = (data) => {
      const result = originalValidate(data);
      
      // If settings is provided, validate its structure
      if (result.isValid && data.settings) {
        const settings = data.settings;
        
        // Validate theme
        if (settings.theme !== undefined) {
          if (!['light', 'dark'].includes(settings.theme)) {
            result.isValid = false;
            result.errors.push({
              field: 'settings.theme',
              message: 'Theme must be either "light" or "dark"'
            });
          }
        }
        
        // Validate language
        if (settings.language !== undefined) {
          if (!['en', 'vi', 'tw'].includes(settings.language)) {
            result.isValid = false;
            result.errors.push({
              field: 'settings.language',
              message: 'Language must be one of: en, vi, tw'
            });
          }
        }
        
        // Validate sound settings
        if (settings.sound !== undefined) {
          if (typeof settings.sound !== 'object' || Array.isArray(settings.sound)) {
            result.isValid = false;
            result.errors.push({
              field: 'settings.sound',
              message: 'Sound settings must be an object'
            });
          } else {
            // Validate bgMusic
            if (settings.sound.bgMusic !== undefined) {
              const bgMusic = Number(settings.sound.bgMusic);
              if (isNaN(bgMusic) || bgMusic < 0 || bgMusic > 100) {
                result.isValid = false;
                result.errors.push({
                  field: 'settings.sound.bgMusic',
                  message: 'Background music volume must be between 0 and 100'
                });
              }
            }
            
            // Validate gameSFX
            if (settings.sound.gameSFX !== undefined) {
              const gameSFX = Number(settings.sound.gameSFX);
              if (isNaN(gameSFX) || gameSFX < 0 || gameSFX > 100) {
                result.isValid = false;
                result.errors.push({
                  field: 'settings.sound.gameSFX',
                  message: 'Game sound effects volume must be between 0 and 100'
                });
              }
            }
          }
        }
      }
      
      return result;
    };
    
    return schema;
  },
};

/**
 * Category Validators
 */
const categoryValidators = {
  create: () => {
    return new ValidationSchema()
      .field('name').required().string().min(1).max(100)
      .field('description').optional().string().max(500)
      .field('icon').optional().string()
      .field('order').optional().integer().positive();
  },

  update: () => {
    return new ValidationSchema()
      .field('name').optional().string().min(1).max(100)
      .field('description').optional().string().max(500)
      .field('icon').optional().string()
      .field('order').optional().integer().positive();
  },
};

/**
 * Vocabulary Validators
 */
const vocabularyValidators = {
  create: () => {
    return new ValidationSchema()
      .field('categoryId').required().objectId()
      .field('traditional').required().string().min(1)
      .field('simplified').optional().string()
      .field('pinyin').required().string()
      .field('meaning').required().string()
      .field('example').optional().string()
      .field('audioUrl').optional().string()
      .field('imageUrl').optional().string()
      .field('difficulty').optional().enum(['beginner', 'intermediate', 'advanced', 'native']);
  },

  update: () => {
    return new ValidationSchema()
      .field('categoryId').optional().objectId()
      .field('traditional').optional().string().min(1)
      .field('simplified').optional().string()
      .field('pinyin').optional().string()
      .field('meaning').optional().string()
      .field('example').optional().string()
      .field('audioUrl').optional().string()
      .field('imageUrl').optional().string()
      .field('difficulty').optional().enum(['beginner', 'intermediate', 'advanced', 'native']);
  },

  query: () => {
    return new ValidationSchema()
      .field('categoryId').optional().objectId()
      .field('difficulty').optional().enum(['beginner', 'intermediate', 'advanced', 'native'])
      .field('page').optional().integer().positive()
      .field('limit').optional().integer().positive()
      .field('search').optional().string();
  },
};

/**
 * Progress Validators
 */
const progressValidators = {
  update: () => {
    return new ValidationSchema()
      .field('vocabularyId').required().objectId()
      .field('isCorrect').required()
      .field('timeTaken').optional().integer().positive()
      .field('gameType').optional().enum(['listening-quiz', 'matching-game', 'translation', 'flashcard']);
  },
};

module.exports = {
  ValidationSchema,
  authValidators,
  categoryValidators,
  vocabularyValidators,
  progressValidators,
};
