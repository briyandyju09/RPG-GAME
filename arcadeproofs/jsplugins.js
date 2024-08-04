(function() {

    var parameters = PluginManager.parameters('TitleCommandPosition');
    var offsetX = Number(parameters['Offset X'] || 0);
    var offsetY = Number(parameters['Offset Y'] || 0);
    var width = Number(parameters['Width'] || 240);
    var background = Number(parameters['Background'] || 0);

    var _Window_TitleCommand_updatePlacement =
            Window_TitleCommand.prototype.updatePlacement;
    Window_TitleCommand.prototype.updatePlacement = function() {
        _Window_TitleCommand_updatePlacement.call(this);
        this.x += offsetX;
        this.y += offsetY;
        this.setBackgroundType(background);
    };

    Window_TitleCommand.prototype.windowWidth = function() {
        return width;
    };

})();

(function() {

  var parameters = PluginManager.parameters('SimpleMsgSideView');
  var displayAttack = Number(parameters['displayAttack']) != 0;
  var position = Number(parameters['position'] || 1);

  var _Window_BattleLog_addText = Window_BattleLog.prototype.addText;
  Window_BattleLog.prototype.addText = function(text) {
   if($gameSystem.isSideView()){
     this.refresh();
     this.wait();
     return;  // not display battle log
   }
   _Window_BattleLog_addText.call(this, text);
  };

  // for sideview battle only
  Window_BattleLog.prototype.addItemNameText = function(itemName) {
    this._lines.push(itemName);
    this.refresh();
    this.wait();
  };

  var _Window_BattleLog_displayAction = 
   Window_BattleLog.prototype.displayAction;
  Window_BattleLog.prototype.displayAction = function(subject, item) {
    if($gameSystem.isSideView()){
      if(displayAttack ||
       !(DataManager.isSkill(item) && item.id == subject.attackSkillId())) {
　　    this.push('addItemNameText', item.name);  // display item/skill name
      } else {
        this.push('wait');
      }
      return;
    }
    _Window_BattleLog_displayAction.call(this, subject, item);
  };

  // to put skill/item name at center
  var _Window_BattleLog_drawLineText = Window_BattleLog.prototype.drawLineText;
  Window_BattleLog.prototype.drawLineText = function(index) {
    if($gameSystem.isSideView() && position == 1){
      var rect = this.itemRectForText(index);
      this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
      this.drawText(this._lines[index], rect.x, rect.y,
       rect.width, 'center');
      return;
    }
    _Window_BattleLog_drawLineText.call(this, index);
  };

})();

(function() {

  //
  // set skill id for attack.
  //
  Game_Actor.prototype.attackSkillId = function() {
    var normalId = Game_BattlerBase.prototype.attackSkillId.call(this);
    if(this.hasNoWeapons()){
      return normalId;
    }
    var weapon = this.weapons()[0];  // at plural weapon, one's first skill.
    var id = weapon.meta.skill_id;
    return id ? Number(id) : normalId;
  };

  //
  // for command at battle
  //
  var _Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
  Scene_Battle.prototype.commandAttack = function() {
    BattleManager.inputtingAction().setAttack();
    // normal attack weapon (or other single attack weapon)
    var action = BattleManager.inputtingAction();
    if(action.needsSelection() && action.isForOpponent()){
      _Scene_Battle_commandAttack.call(this);
      return;
    }
    // special skill weapon
    this.onSelectAction();
  };

})();

