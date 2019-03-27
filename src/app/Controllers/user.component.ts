import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FriendsApiService } from '../Services/FriendsApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { CacheService } from '../Services/CacheService';
import { switchMap,  } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';
import { MessageService } from '../Services/MessageService';
import { ConversationApiService } from '../Services/ConversationApiService';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css',
                '../Styles/badge.css']
})

export class UserComponent implements OnInit {
    public info: KahlaUser;
    public conversationId: number;
    public areFriends: boolean;
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private route: ActivatedRoute,
        private friendsApiService: FriendsApiService,
        private router: Router,
        private cacheService: CacheService,
        private headerService: HeaderService,
        public messageService: MessageService,
        private conversationApiService: ConversationApiService
    ) {
        this.headerService.title = 'Profile';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    public ngOnInit(): void {
        this.route.params
            .pipe(switchMap((params: Params) => this.friendsApiService.UserDetail(params['id'])))
            .subscribe(response => {
                this.info = response.user;
                this.conversationId = response.conversationId;
                this.areFriends = response.areFriends;
                this.info.avatarURL = Values.fileAddress + this.info.headImgFileKey;
            });
    }

    public delete(id: string): void {
        Swal.fire({
            title: 'Are you sure to delete a friend?',
            type: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.friendsApiService.DeleteFriend(id)
                    .subscribe(response => {
                        Swal.fire('Success', response.message, 'success');
                        this.cacheService.UpdateConversation();
                        this.router.navigate(['/friends']);
                    });
            }
        });
    }

    public request(id: string): void {
        this.friendsApiService.CreateRequest(id)
            .subscribe(response => {
                if (response.code === 0) {
                    Swal.fire('Success', response.message, 'success');
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            });
    }

    public report(): void {
        Swal.fire({
            title: 'Report',
            input: 'textarea',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
                maxlength: '200'
            },
            confirmButtonColor: 'red',
            showCancelButton: true,
            confirmButtonText: 'Report'
          }).then((result) => {
            if (result.value) {
                if (result.value.length >= 5) {
                    this.friendsApiService.Report(this.info.id, result.value).subscribe(response => {
                        if (response.code === 0) {
                            Swal.fire('Success', response.message, 'success');
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    }, () => {
                        Swal.fire('Error', 'Report error.', 'error');
                    });
                } else {
                    Swal.fire('Error', 'The reason\'s length should between five and two hundreds.', 'error');
                }
            }
          });
    }

    public setTimer(): void {
        Swal.fire({
            title: 'Set self-destruct timer',
            input: 'select',
            inputOptions: {
                5: '5 seconds',
                30: '30 seconds',
                60: '1 minute',
                600: '10 minutes',
                3600: '1 hour',
                [3600 * 24]: '1 day',
                [3600 * 24 * 7]: '1 week',
                [Math.pow(2, 31) - 1]: 'off'
            },
            inputPlaceholder: 'Select one',
            showCancelButton: true
        }).then(selected => {
            if (selected.value) {
                this.conversationApiService.UpdateMessageLifeTime(this.conversationId, selected.value)
                    .subscribe(result => {
                        if (result.code === 0) {
                            Swal.fire({
                                title: 'Success!',
                                type: 'success',
                                text: result.message
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                type: 'error',
                                text: result.message
                            });
                        }
                    });
            }
        });
    }
}
