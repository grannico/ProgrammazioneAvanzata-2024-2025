// src/models/User.ts
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, AllowNull, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @Default('USER')
  @Column({
    type: DataType.ENUM('USER', 'ADMIN'),
    allowNull: false
  })
  role!: 'USER' | 'ADMIN';

  @Default(100.00) // Saldo iniziale di cortesia
  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(10, 2), // Precisione fissa: 10 cifre totali, 2 decimali
    get() {
      // Converte il valore del DB (stringa) in numero per l'applicazione
      const value = this.getDataValue('tokenBalance');
      return value ? parseFloat(value) : 0;
    }
  })
  tokenBalance!: number;
}