
export class Consumer {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.phone_number = userData.phone_number;
    this.user_type = ['Consumer'];
    this.profile_image = userData.profile_image;
  }
}

export class Seller {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.phone_number = userData.phone_number;
    this.user_type = ['Seller'];
    this.profile_image = userData.profile_image;
  }
}