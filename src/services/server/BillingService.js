import config from '../../config';

import { subscriptions } from '../../static/enums/subscriptions';
import { Subcription } from '../../static/Subscription.js';
import SubscriptionService from './SubscriptionService.js';
import KlarnaAPIService from './KlarnaAPIService.js';

class BillingService {

    /**
     * isActive():
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static isActive(subscription_data){
        return subscription_data.subscription.status === subscriptions.statuses.active;
    }

    /**
     * isCanceled():
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static isCanceled(subscription_data){
        return subscription_data.subscription.status === subscriptions.statuses.canceled;
    }

    /**
     * isBindingTimeOver():
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static isBindingTimeOver(subscription_data){
        const now = Date.now();
        // Fall back if binding time does not exist.
        const binding_time_ms = subscription_data.subscription.binding_time_ms ? subscription_data.subscription.binding_time_ms : subscriptions.billing_settings.binding_time_ms;
        return now > binding_time_ms + subscription_data.subscription.created_at;
    }

    /**
     * isBillable()
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static isBillable(subscription_data){
        const now = Date.now();
        return now > subscription_data.subscription.current_period_end && this.isActive(subscription_data);
    }

    /**
     * isOverdue()
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static isOverdue(subscription_data){
        const now = Date.now();
        return now > (subscription_data.subscription.current_period_end + subscriptions.billing_settings.overdue_ms) && this.isActive(subscription_data);
    }

    /**
     * getSubscriptionStatus()
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static getBillingStatus(subscription_data){
        const is_billable = this.isBillable(subscription_data);
        const is_overdue = this.isOverdue(subscription_data);

        let billing_status = '';
        if (is_overdue) {
            billing_status = subscriptions.billing_statuses.overdue;
        } else if (is_billable) {
            billing_status = subscriptions.billing_statuses.billable;
        } else {
            billing_status = subscriptions.billing_statuses.already_billed;
        }
        return billing_status;
    }

    /**
     * billSubscription()
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static billSubscription(subscription_data){
        const billing_status = this.getBillingStatus(subscription_data);
        switch(billing_status) {
            case subscriptions.billing_statuses.overdue:
                // We've tried to bill you for too long. Begone thot!
                SubscriptionService.unsubscribeUser(subscription_data.user_id);
            break;
            case subscriptions.billing_statuses.billable:
                KlarnaAPIService.chargeCustomerToken(subscription_data, ()=> {SubscriptionService.setAsBilled(subscription_data)});
            break;
            case subscriptions.billing_statuses.already_billed:
                return;
            break;
            default:
                console.error('Invalid billing_status!', {billing_status});
        }
    }

    /**
     * billAllSubscriptions()
     */
    static billAllSubscriptions(){
        SubscriptionService.getAllSubscriptions().then((all_subscription_data)=>{
            all_subscription_data.forEach((subscription_data)=>{
                this.billSubscription(subscription_data);
            });
        }).catch(err => {console.error('ERROR: billAllSubscriptions()', err);})

    }

}

export default BillingService;
