import {User} from './user';

export interface Message {
  toid? : string[],
  fromid: string,
    msg? : string,
    sender_id : string,
    selfsockets: string[],
    receiver_id: string,
    createdAt: Date,
    drawImg?:string,
    file?:string,
    filename?:string,
    img?:string,
    imgname?:string,
    read?:boolean
}
