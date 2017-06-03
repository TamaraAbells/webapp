import Injectable from 'utils/injectable';

class NavbarController extends Injectable {
  constructor(...injections) {
    super(NavbarController.$inject, injections);

    this.animationSrc = '';
    this.expanded = false;
    this.notificationCount = 0;

    this.EventService.on(this.EventService.events.FETCH_USER_ME_DATA, _ => {
      this.UserService.getNotifications(this.UserService.user.username, true)
        .then( notificationCount => {
          this.notificationCount = notificationCount;
          this.EventService.on('UNREAD_NOTIFICATION_CHANGE', changedBy => this.notificationCount += changedBy );
        })
        .catch( _ => this.AlertsService.push('error', 'Unable to fetch notifications.') );
    });
  }

  isControlSelected(control) {
    return this.$state.current.name.indexOf(control) !== -1 && 'root' === this.$state.params.branchid;
  }

  logout () {
    this.expanded = false;
    this.UserService.logout()
      .then( _ => {
        this.$state.go('auth.login');
      })
      .catch( _ => {
        this.AlertsService.push('error', 'Unable to log out.');
      });
  }

  onHomePage () {
    return 'weco.home' === this.$state.current.name;
  }

  showNotificationCount () {
    return this.notificationCount > 0;
  }

  toggleNav () {
    this.expanded = !this.expanded;
  }

  triggerAnimation () {
    // set animation src to the animated gif
    this.$timeout( _ => { this.animationSrc = '/assets/images/logo-animation.gif'; });
    
    // cancel after 1 sec
    this.$timeout( _ => { this.animationSrc = ''; }, 1000);
  }
}

NavbarController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'EventService',
  'UserService'
];

export default NavbarController;