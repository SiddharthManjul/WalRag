#[test_only]
module WalRag::access_control_tests {
    use WalRag::access_control::{Self, AccessPolicy};
    use sui::test_scenario::{Self as ts, Scenario};

    // Test addresses
    const OWNER: address = @0xA;
    const USER1: address = @0xB;
    const USER2: address = @0xC;

    // Helper function to create a test policy
    fun create_test_policy(scenario: &mut Scenario, is_public: bool) {
        ts::next_tx(scenario, OWNER);
        {
            let document_id = b"test_document_123";
            access_control::create_policy(document_id, is_public, ts::ctx(scenario));
        };
    }

    #[test]
    fun test_create_public_policy() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        // Create public policy
        create_test_policy(scenario, true);

        // Verify policy was created and is shared
        ts::next_tx(scenario, OWNER);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            let (doc_id, owner, is_public, _) = access_control::get_policy_info(&policy);

            assert!(doc_id == b"test_document_123", 0);
            assert!(owner == OWNER, 1);
            assert!(is_public == true, 2);

            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_create_private_policy() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        // Create private policy
        create_test_policy(scenario, false);

        ts::next_tx(scenario, OWNER);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            let (_, _, is_public, _) = access_control::get_policy_info(&policy);

            assert!(is_public == false, 0);

            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_grant_access() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        // Grant access to USER1
        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::grant_access(&mut policy, USER1, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        // Verify USER1 has access
        ts::next_tx(scenario, USER1);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            assert!(access_control::has_access(&policy, USER1) == true, 0);
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_revoke_access() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        // Grant then revoke access
        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::grant_access(&mut policy, USER1, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::revoke_access(&mut policy, USER1, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        // Verify USER1 no longer has access
        ts::next_tx(scenario, USER1);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            assert!(access_control::has_access(&policy, USER1) == false, 0);
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_owner_always_has_access() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        ts::next_tx(scenario, OWNER);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            // Owner should have access even without being in allowed_users
            assert!(access_control::has_access(&policy, OWNER) == true, 0);
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_public_policy_everyone_has_access() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, true);

        ts::next_tx(scenario, USER1);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            assert!(access_control::has_access(&policy, USER1) == true, 0);
            assert!(access_control::has_access(&policy, USER2) == true, 1);
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_make_public() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        // Make policy public
        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::make_public(&mut policy, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        // Verify anyone has access now
        ts::next_tx(scenario, USER1);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            let (_, _, is_public, _) = access_control::get_policy_info(&policy);
            assert!(is_public == true, 0);
            assert!(access_control::has_access(&policy, USER1) == true, 1);
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_make_private() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, true);

        // Make policy private
        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::make_private(&mut policy, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        // Verify USER1 no longer has access
        ts::next_tx(scenario, USER1);
        {
            let policy = ts::take_shared<AccessPolicy>(scenario);
            let (_, _, is_public, _) = access_control::get_policy_info(&policy);
            assert!(is_public == false, 0);
            assert!(access_control::has_access(&policy, USER1) == false, 1);
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 1)] // E_NOT_OWNER
    fun test_grant_access_non_owner_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        // USER1 tries to grant access (should fail)
        ts::next_tx(scenario, USER1);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::grant_access(&mut policy, USER2, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 2)] // E_ALREADY_HAS_ACCESS
    fun test_grant_access_duplicate_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::grant_access(&mut policy, USER1, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        // Try to grant again (should fail)
        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::grant_access(&mut policy, USER1, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 3)] // E_NO_ACCESS
    fun test_revoke_access_non_existent_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_policy(scenario, false);

        // Try to revoke access that was never granted
        ts::next_tx(scenario, OWNER);
        {
            let mut policy = ts::take_shared<AccessPolicy>(scenario);
            access_control::revoke_access(&mut policy, USER1, ts::ctx(scenario));
            ts::return_shared(policy);
        };

        ts::end(scenario_val);
    }
}
