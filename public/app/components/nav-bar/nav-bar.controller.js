import Injectable from 'utils/injectable';

class NavBarController extends Injectable {
  constructor(...injections) {
    super(NavBarController.$inject, injections);

    this.expanded = false;
    this.notificationCount = 0;
    this.animationSrc = '';
  }

  logout() {
    this.expanded = false;
    this.UserService.logout().then(() => {
      this.$state.go('auth.login');
    }).catch(() => {
      this.AlertsService.push('error', 'Unable to log out.');
    });
  }

  isControlSelected(control) {
    return this.$state.current.name.indexOf(control) > -1 && this.$state.params.branchid === 'root';
  }

  onHomePage() {
    return this.$state.current.name === 'weco.home';
  }

  toggleNav() {
    // getFollowedBranches();
    this.expanded = !this.expanded;
  }

  showNotificationCount() {
    return this.notificationCount > 0;
  }

  triggerAnimation() {
    // set animation src to the animated gif
    this.$timeout(() => { this.animationSrc = '/assets/images/logo-animation.gif'; });
    // cancel after 1 sec
    this.$timeout(() => { this.animationSrc = ''; }, 1000);
  }
}
NavBarController.$inject = ['$timeout', 'UserService', '$state', 'AlertsService'];

export default NavBarController;