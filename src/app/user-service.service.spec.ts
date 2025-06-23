import { TestBed } from '@angular/core/testing';

<<<<<<< HEAD
import { UserProfileService } from './user-service.service';

describe('UserServiceService', () => {
  let service: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfileService);
=======
import { UserServiceService } from './user-service.service';

describe('UserServiceService', () => {
  let service: UserServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserServiceService);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
