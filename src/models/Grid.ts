import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';
import { User } from './User';
import { GridVersion } from './GridVersion';

@Table({ tableName: 'grids', timestamps: true })
export class Grid extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  creatorId!: number;

  @BelongsTo(() => User)
  creator!: User;

  // Puntatore alla versione "ufficiale" attuale
  @ForeignKey(() => GridVersion)
  @Column(DataType.INTEGER)
  currentVersionId?: number;

  @BelongsTo(() => GridVersion, { as: 'currentVersion', foreignKey: 'currentVersionId', constraints: false })
  currentVersion?: GridVersion;

  @HasMany(() => GridVersion)
  versions!: GridVersion[];
}