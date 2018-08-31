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
    read?:boolean,
    tutor_read?:boolean,
    learner_read?:boolean
}


export interface Session {
  tutor_user_id : number,
  learner_user_id: number,
  session_date: Date,
  session_subject:string,
  session_location:string,
  learner_name:string,
  tutor_name:string
}


export interface MessageSession {
  sender_id:string,
  receiver_id:string,
  tutor_user_id : number,
  learner_user_id: number,
  session_date: Date,
  session_subject:string,
  session_location:string,
  learner_name:string,
  tutor_name:string,
  read?:boolean,
  tutor_read?:boolean,
  learner_read?:boolean

}
