import { MongooseDocument } from './mongoose-document';
import { prop } from '@typegoose/typegoose';

export class TwitchTvUser extends MongooseDocument {
  @prop({ required: true })
  userId!: string;

  @prop({ required: true })
  login!: string;

  @prop()
  displayName?: string;

  @prop()
  profileImageUrl?: string;
}
