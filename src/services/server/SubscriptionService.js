import config from '../../config';

import { subscriptions } from '../../static/enums/subscriptions';
import Subscription from '../../static/Subscription.js';
import BillingService from './BillingService';
import ThinkificService from './ThinkificService';

class SubscriptionService {
    static userDataToSubscriptionOnly(user_data){
        const subscription = {
            user_id: user_data.id,
            affiliate_code: ThinkificService.toJson(user_data.custom_profile_fields, 'affiliate_code'),
            subscription: ThinkificService.toJson(user_data.custom_profile_fields, 'subscription')
        };
        if (subscription.subscription) {
            return subscription;
        }
    }

    /**
     * getAllSubscriptions()
     * @returns { Promise: Subscription + user_id + affiliate_code } all_subscription_data_promise 
     */
    static getAllSubscriptions(){
        // 1. GET all users from Thinkific DB
        // 2. MAP into an object with subscription-info and user_id
        const all_subscription_data_promise = new Promise((resolve, reject) => {
            ThinkificService.getAllUsers()
                .then(all_items =>{
                    const all_subscriptions = all_items.items.map(user => {
                        return this.userDataToSubscriptionOnly(user);
                    }).filter(subscription => subscription!== undefined);
                    resolve(all_subscriptions);
                }).catch(err => {
                    console.error('getAllSubscriptions():', err);
                    reject(err);
                });
        });
        return all_subscription_data_promise
    }

     /**
     * getSubscriptionByUserId()
     * @returns { Promise: Subscription + user_id + affiliate_code } subscription_data_promise 
     */
    static getSubscriptionByUserId(user_id){
        // 1. GET users by ID from Thinkific DB
        // 2. MAP into an object with subscription-info and user_id
        const subscription_data_promise = new Promise((resolve, reject) => {
            ThinkificService.getUserById(user_id)
                .then(user =>{
                    const subscription = this.userDataToSubscriptionOnly(user);
                    resolve(subscription);
                }).catch(err => {
                    console.error('getAllSubscriptions():', err);
                    reject(err);
                });
        });
        return subscription_data_promise;
    }

    /**
     * setAsBilled()
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static setAsBilled(subscription_data, callback = ()=>{}){
        let billed_subscription = subscription_data.subscription;
        const billing_interval_ms = subscriptions.billing_intervals[billed_subscription.billing_interval].interval_ms;

        billed_subscription.current_period_start = billed_subscription.current_period_end;
        billed_subscription.current_period_end += billing_interval_ms;

        const update_doc = {
            custom_profile_fields: [ThinkificService.toCustomProfileField(billed_subscription, 'subscription')]
        }

        // 2. Update user's bundle
        const update_callback = ()=>{
            const bundle_id =  42623; // TODO: Static for now.
            // updateBundle did not work. Thinkific API sucks. Recreate enrollment instead.
            ThinkificService.enrollToBundle({user_id: subscription_data.user_id, bundle_id, subscription: billed_subscription}, callback);
        }

        // 1. Update user subscription
        ThinkificService.updateUser(subscription_data.user_id, update_doc, update_callback);
    }

    /**
     * setAsCanceled(): Cancels membershop to bundle but user keeps access until next billing period.
     * @param { Subscription + user_id + affiliate_code } subscription_data 
     */
    static setAsCanceled(subscription_data, callback = ()=>{}){
        const canceled_subscription = subscription_data.subscription;
        if (canceled_subscription.status !== subscriptions.statuses.canceled) {
            canceled_subscription.status = subscriptions.statuses.canceled;
            canceled_subscription.cancel_at_period_end = true;
            canceled_subscription.canceled_at = Date.now();
            
            const update_doc = {
                custom_profile_fields: [ThinkificService.toCustomProfileField(canceled_subscription, 'subscription')]
            }
            ThinkificService.updateUser(subscription_data.user_id, update_doc, callback);
        }
    }

    
    /**
     * subscribeUser()
     * @param { string } user_id 
     * @param { Number } bundle_id 
     * @param { string } subscription_billing_interval  e.g. 'monthly'
     * @param { string } customer_token 
     */
    static subscribeUser({user_id, bundle_id, subscription_billing_interval, customer_token}, callback = ()=>{}) {
        // 1. CREATE new subscription 
        // 2. UPDATE Thinkific user with newly created subscription data
        // 3. UPDATE Enroll Thinkific user in Bundle
        const subscription = new Subscription(user_id, subscription_billing_interval, customer_token).toObject();
        const update_doc = {
            custom_profile_fields: [ThinkificService.toCustomProfileField(subscription, 'subscription')]
        }
        ThinkificService.updateUser(user_id, update_doc, ()=>{
            ThinkificService.enrollToBundle({user_id, bundle_id, subscription}, callback);
        });

        return subscription;
    }

    /**
     * unsubscribeUser(): Unsubscribes user. User will keep access to bundle until next billing period.
     * @param { string } user_id 
     */
    static unsubscribeUser(user_id, success_callback = ()=>{}, fail_callback = ()=>{}) {
        // 1. FIND subscription by user_id  
        // 2. MODIFY subscription data to canceled
        this.getSubscriptionByUserId(user_id)
            .then(subscription_data => {
                const is_binding_time_over = BillingService.isBindingTimeOver(subscription_data);
                if (is_binding_time_over) {
                    const unsubscribe_callback = ()=>{
                        success_callback();
                        console.log(`[UNSUBCRIBED]: User ID ${user_id}, Customer Token ${subscription_data.subscription.customer_token}.`);
                    }
                    this.setAsCanceled(subscription_data, unsubscribe_callback);
                } else {
                    console.log('[UNSUBCRIBE FAILED]: Binding time isn\'t over yet');
                    fail_callback();
                }
            }).catch(err =>{
                console.error('unsubscribeUser(): ', err);
                fail_callback(err);
            });
        
    }

}

export default SubscriptionService;
