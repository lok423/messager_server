import {User} from './user';

export interface Message {
  toid? : string[],
  fromid: string,
    msg? : string,
    senderName : string,
    selfsockets: string[],
    receiverName: string,
    createdAt: Date,
    drawImg?:string,
    file?:string,
    filename?:string,
    img?:string,
    imgname?:string,
    read?:boolean
}


export interface UpdateMsg {

    currentUserName : string,
    selectedUserName: string,
    createdAt: Date,

}
