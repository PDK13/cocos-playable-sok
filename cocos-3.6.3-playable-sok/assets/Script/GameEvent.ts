import { _decorator } from 'cc';

export default class GameEvent  {
    static GAME_STORE_OPEN = "GAME_STORE_OPEN";
    static GAME_STORE_BUTTON: string = 'GAME_STORE_BUTTON';

    static PLAYER_JUMP: string = 'EVENT_PLAYER_JUMP';
    static PLAYER_FIRE: string = 'EVENT_PLAYER_FIRE';
    static PLAYER_SMASH_DOWN: string = 'EVENT_PLAYER_SMASH_DOWN';
    static PLAYER_MOVE_LEFT: string = 'EVENT_PLAYER_MOVE_LEFT';
    static PLAYER_MOVE_RIGHT: string = 'EVENT_PLAYER_MOVE_RIGHT';
    static PLAYER_MOVE_STOP: string = 'EVENT_PLAYER_MOVE_STOP';
    static PLAYER_STOP: string = 'EVENT_PLAYER_STOP';
    static PLAYER_HURT = 'PLAYER_HURT';
    static PLAYER_X4 = 'PLAYER_X4';
    static PLAYER_GROUND = 'PLAYER_GROUND';

    static GAME_FINISH: string = 'GAME_FINISH';
    static GAME_LOSE: string = 'GAME_LOSE';
    static GAME_TRIGGER_FIRE: string = 'TRIGGER_FIRE';
    static GAME_TRIGGER_SMASH_DOWN: string = 'TRIGGER_SMASH_DOWN';
    
    static TRIGGER_KEY: string = 'TRIGGER_KEY';
    static TRIGGER_BOSS_DUMMY: string = "TRIGGER_BOSS_DUMMY";
    
    static CUTSCENE_CONTINUE = "CUTSCENE_CONTINUE";
}