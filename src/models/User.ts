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
  @Column(DataType.ENUM('ADMIN', 'USER'))
  role!: 'ADMIN' | 'USER';

  @Default(100.0) // Saldo iniziale di cortesia
  @AllowNull(false)
  @Column(DataType.FLOAT)
  tokenBalance!: number;
}