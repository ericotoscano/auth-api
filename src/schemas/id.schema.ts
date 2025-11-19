import { z } from 'zod';

const idSchemaFactory = (label: 'user' | 'adm' | 'driver' | 'tournament') => {
  return z.object({
    [`${label}Id`]: z
      .string({
        required_error: `${label}Id is required.`,
        invalid_type_error: `${label}Id must be a string.`,
      })
      .length(24, {
        message: `Invalid ${label}Id length. Must be exactly 24 characters.`,
      })
      .regex(/^[a-fA-F0-9]{24}$/, {
        message: `Invalid ${label}Id format. Must be a 24-character hexadecimal string.`,
      })
      .nonempty({ message: `${label}Id cannot be empty.` }),
  });
};

export const userIdSchema = idSchemaFactory('user');
export const admIdSchema = idSchemaFactory('adm');
export const driverIdSchema = idSchemaFactory('driver');
export const tournamentIdSchema = idSchemaFactory('tournament');
