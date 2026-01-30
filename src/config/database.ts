import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Grid } from '../models/Grid';
import { GridVersion } from '../models/GridVersion';
import { UpdateRequest } from '../models/UpdateRequest';

dotenv.config();

class Database {
  private static instance: Sequelize;

  private constructor() {} // Il costruttore privato impedisce "new Database()"

  public static getInstance(): Sequelize {
    if (!Database.instance) {
      Database.instance = new Sequelize(process.env.DB_URL || 'postgres://user:password@localhost:5432/crowd_pathfinding', {
        dialect: 'postgres',
        logging: false,
        // Qui aggiungeremo i modelli più avanti
        models: [User, Grid, GridVersion, UpdateRequest], 
      });
      console.log('✅ Istanza Sequelize creata (Singleton)');
    }
    return Database.instance;
  }
}

export const sequelize = Database.getInstance();