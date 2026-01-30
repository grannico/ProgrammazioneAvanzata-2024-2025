import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, AllowNull, Default } from 'sequelize-typescript';
import { User } from './User';
import { Grid } from './Grid';
import { GridVersion } from './GridVersion';

@Table({ tableName: 'update_requests', timestamps: true })
export class UpdateRequest extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Default('PENDING')
  @Column(DataType.ENUM('PENDING', 'ACCEPTED', 'REJECTED'))
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  // I dati della griglia che l'utente propone di inserire
  @AllowNull(false)
  @Column(DataType.JSON)
  proposedData!: any;

  // Il costo calcolato (0.35 * celle modificate) al momento della richiesta
  @AllowNull(false)
  @Column(DataType.FLOAT)
  tokenCost!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  requesterId!: number;

  @BelongsTo(() => User)
  requester!: User;

  @ForeignKey(() => Grid)
  @Column(DataType.INTEGER)
  gridId!: number;

  @BelongsTo(() => Grid)
  grid!: Grid;

  // Fondamentale: su quale versione della griglia si basa questa proposta?
  @ForeignKey(() => GridVersion)
  @Column(DataType.INTEGER)
  baseVersionId!: number;

  @BelongsTo(() => GridVersion)
  baseVersion!: GridVersion;
}