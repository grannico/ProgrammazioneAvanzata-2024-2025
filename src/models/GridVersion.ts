import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';
import { Grid } from './Grid';

@Table({ tableName: 'grid_versions', timestamps: true })
export class GridVersion extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Grid)
  @Column(DataType.INTEGER)
  gridId!: number;

  @Column(DataType.INTEGER)
  versionNumber!: number;

  // I dati della griglia salvati come JSON (es. la matrice degli ostacoli)
  @AllowNull(false)
  @Column(DataType.JSON)
  data!: any;

  @BelongsTo(() => Grid)
  grid!: Grid;
}