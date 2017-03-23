import Injectable from 'utils/injectable';

class BranchNucleusController extends Injectable {
  constructor(...injections) {
    super(BranchNucleusController.$inject, injections);

    this.tabItems = [];
    this.tabStates = [];
    this.tabStateParams = [];

    let updateTabs = () => {
      this.$timeout(() => {
        if(Object.keys(this.BranchService.branch) === 0) return;

        this.tabItems = ['about', 'moderators'];
        this.tabStates = ['weco.branch.nucleus.about', 'weco.branch.nucleus.moderators'];
        this.tabStateParams = [{ branchid: this.BranchService.branch.id }, { branchid: this.BranchService.branch.id }];

        if(this.BranchService.branch.mods) {
          for(let i = 0; i < this.BranchService.branch.mods.length; i++) {
            // is the authd user a mod of this branch?
            if(this.BranchService.branch.mods[i].username === this.UserService.user.username) {
              // add settings tab
              if(this.tabItems.indexOf('settings') === -1) {
                this.tabItems.push('settings');
                this.tabStates.push('weco.branch.nucleus.settings');
                this.tabStateParams.push({ branchid: this.BranchService.branch.id });
              }
              // add mod tools tab
              if(this.tabItems.indexOf('mod tools') === -1) {
                this.tabItems.push('mod tools');
                this.tabStates.push('weco.branch.nucleus.modtools');
                this.tabStateParams.push({ branchid: this.BranchService.branch.id });
              }
              // add flagged posts tab
              if(this.tabItems.indexOf('flagged posts') === -1) {
                this.tabItems.push('flagged posts');
                this.tabStates.push('weco.branch.nucleus.flaggedposts');
                this.tabStateParams.push({ branchid: this.BranchService.branch.id });
              }
            }
          }
        }
      });
    };

    updateTabs();
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, updateTabs);
    this.EventService.on(this.EventService.events.CHANGE_USER, updateTabs);
  }

  addHTMLLineBreaks(str) {
    if(str) {
      return str.split('\n').join('<br>');
    }
  }
}
BranchNucleusController.$inject = ['$timeout', 'BranchService', 'UserService', 'EventService'];

export default BranchNucleusController;