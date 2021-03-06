import { Tf2ClassName } from './tf2-class-name';
import { prop, Ref } from '@typegoose/typegoose';
import { Player } from './player';

export class PlayerSkill {
  @prop({ ref: () => Player, unique: true })
  player?: Ref<Player>;

  @prop({ type: Number })
  skill?: Map<Tf2ClassName, number>;
}
