import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { HomeService } from '../Services/HomeService';

@Component({
    selector: 'app-conversations',
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.scss',
        '../Styles/reddot.scss',
        '../Styles/button.scss',
        '../Styles/badge.scss']
})
export class ConversationsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private router: Router,
        public cacheService: CacheService,
        public messageService: MessageService,
        private homeService: HomeService,
    ) {
    }

    public ngOnInit(): void {
        if (this.cacheService.cachedData.me) {
            this.cacheService.updateConversation();
        }
        setTimeout(() => {
            if (this.homeService.floatingHomeWrapper === null) {
                document.body.scroll(0, 0);
            } else {
                this.homeService.floatingHomeWrapper.scroll(0, 0);
            }
        }, 0);
    }

    public detail(info: ContactInfo): void {
        if (info.discriminator === 'GroupConversation') {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public current(info: ContactInfo): boolean {
        return new RegExp(`^.+\/${info.conversationId}(\/.*)*$`, 'g').test(this.router.url);
    }

    public talk(id: number, unread: number): void {
        const conversation = this.cacheService.cachedData.conversations.find(x => x.conversationId === id);
        conversation.unReadAmount = 0;
        conversation.someoneAtMe = false;
        this.cacheService.updateTotalUnread();
        if (this.router.isActive(`/talking/${id}`, false)) {
            return;
        }
        if (unread > 0 && unread <= 50) {
            this.router.navigate(['/talking', id, unread]);
        } else {
            this.router.navigate(['/talking', id]);
        }
    }

    public ngOnDestroy(): void {
        this.loadingImgURL = null;
    }

    public getLatestUserName(info: ContactInfo): string {
        if (this.cacheService.cachedData.me && info.latestMessage.senderId === this.cacheService.cachedData.me.id) {
            return this.cacheService.cachedData.me.nickName + ': ';
        }
        const groupDetail = this.cacheService.cachedData.conversationDetail[info.conversationId];
        if (groupDetail) {
            const usr = groupDetail.users.find(t => t.userId === info.latestMessage.senderId);
            return usr ? usr.user.nickName + ': ' : '';
        }

        return '';
    }
}
