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
  defaultValue: 'USER', // Di default, chi si registra è un utente semplice
  allowNull: false
})
role!: 'USER' | 'ADMIN';

  @Default(100.0) // Saldo iniziale di cortesia
  @AllowNull(false)
  @Column(DataType.FLOAT)
  tokenBalance!: number;
}