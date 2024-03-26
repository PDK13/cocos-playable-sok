import { _decorator } from 'cc';

export default class GameTag {
    static GROUND = -1;
    static GROUND_BREAK = -2;

    static PLAYER = 100;
    static PLAYER_ATTACK = 101;
    static PLAYER_ATTACK_SMASH_DOWN_AIR = 102;
    static PLAYER_ATTACK_SMASH_DOWN_GROUND = 103;

    static MONSTER = 200;
    static MONSTER_HIT = 201; //Player not hurt if touch, and can attack

    static TRIGGER_JUMP = 500;
    static TRIGGER_JUMP_SMASH_DOWN = 501;
    static TRIGGER_OBJ_CONVEYOR_BELT = 502;
    static TRIGGER_BOSS_DUMMY = 503;
}