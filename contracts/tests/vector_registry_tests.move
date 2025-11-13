#[test_only]
module WalRag::vector_registry_tests {
    use WalRag::vector_registry::{Self, VectorRegistry};
    use sui::test_scenario::{Self as ts, Scenario};
    use std::string;

    // Test addresses
    const OWNER: address = @0xA;
    const USER1: address = @0xB;
    const USER2: address = @0xC;

    // Helper function to create a test registry
    fun create_test_registry(scenario: &mut Scenario) {
        ts::next_tx(scenario, OWNER);
        {
            vector_registry::create_registry(ts::ctx(scenario));
        };
    }

    // Helper function to add a test document
    fun add_test_document(
        scenario: &mut Scenario,
        sender: address,
        filename: vector<u8>,
        vector_blob_id: vector<u8>,
        document_blob_id: vector<u8>,
        chunk_count: u64
    ) {
        ts::next_tx(scenario, sender);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::add_document(
                &mut registry,
                filename,
                vector_blob_id,
                document_blob_id,
                chunk_count,
                b"text-embedding-3-small",
                option::none(),
                ts::ctx(scenario)
            );
            ts::return_shared(registry);
        };
    }

    #[test]
    fun test_create_registry() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Verify registry was created
        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let (total_docs, version, owner) = vector_registry::get_registry_stats(&registry);

            assert!(total_docs == 0, 0);
            assert!(version == 1, 1);
            assert!(owner == OWNER, 2);

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_add_document() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);
        add_test_document(
            scenario,
            OWNER,
            b"test.md",
            b"vector_blob_abc123",
            b"doc_blob_xyz789",
            5
        );

        // Verify document was added
        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let (total_docs, version, _) = vector_registry::get_registry_stats(&registry);

            assert!(total_docs == 1, 0);
            assert!(version == 2, 1); // Version increments on add

            // Check document exists
            let filename = string::utf8(b"test.md");
            assert!(vector_registry::document_exists(&registry, filename) == true, 2);

            // Get document info
            let doc_info = vector_registry::get_document_info(&registry, filename);
            assert!(vector_registry::get_chunk_count(doc_info) == 5, 3);
            assert!(vector_registry::get_vector_blob_id(doc_info) == string::utf8(b"vector_blob_abc123"), 4);
            assert!(vector_registry::get_document_blob_id(doc_info) == string::utf8(b"doc_blob_xyz789"), 5);

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_add_multiple_documents() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Add 3 documents
        add_test_document(scenario, OWNER, b"doc1.md", b"vec1", b"blob1", 2);
        add_test_document(scenario, OWNER, b"doc2.md", b"vec2", b"blob2", 3);
        add_test_document(scenario, OWNER, b"doc3.md", b"vec3", b"blob3", 4);

        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let (total_docs, version, _) = vector_registry::get_registry_stats(&registry);

            assert!(total_docs == 3, 0);
            assert!(version == 4, 1); // Version increments for each add (1 initial + 3 adds)

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_update_document_vectors() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);
        add_test_document(scenario, OWNER, b"test.md", b"old_vector", b"doc_blob", 5);

        // Update vectors
        ts::next_tx(scenario, OWNER);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::update_document_vectors(
                &mut registry,
                b"test.md",
                b"new_vector",
                10,
                ts::ctx(scenario)
            );
            ts::return_shared(registry);
        };

        // Verify update
        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let doc_info = vector_registry::get_document_info(&registry, string::utf8(b"test.md"));

            assert!(vector_registry::get_chunk_count(doc_info) == 10, 0);
            assert!(vector_registry::get_vector_blob_id(doc_info) == string::utf8(b"new_vector"), 1);

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_remove_document() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);
        add_test_document(scenario, OWNER, b"test.md", b"vector", b"doc", 5);

        // Remove document
        ts::next_tx(scenario, OWNER);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::remove_document(&mut registry, b"test.md", ts::ctx(scenario));
            ts::return_shared(registry);
        };

        // Verify removal
        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let (total_docs, _, _) = vector_registry::get_registry_stats(&registry);

            assert!(total_docs == 0, 0);
            assert!(vector_registry::document_exists(&registry, string::utf8(b"test.md")) == false, 1);

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_version_tracking() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Initial version is 1
        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            assert!(vector_registry::get_version(&registry) == 1, 0);
            ts::return_shared(registry);
        };

        // Add document - version becomes 2
        add_test_document(scenario, OWNER, b"doc1.md", b"vec1", b"blob1", 5);

        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            assert!(vector_registry::get_version(&registry) == 2, 1);
            ts::return_shared(registry);
        };

        // Update document - version becomes 3
        ts::next_tx(scenario, OWNER);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::update_document_vectors(
                &mut registry,
                b"doc1.md",
                b"new_vec",
                10,
                ts::ctx(scenario)
            );
            assert!(vector_registry::get_version(&registry) == 3, 2);
            ts::return_shared(registry);
        };

        // Remove document - version becomes 4
        ts::next_tx(scenario, OWNER);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::remove_document(&mut registry, b"doc1.md", ts::ctx(scenario));
            assert!(vector_registry::get_version(&registry) == 4, 3);
            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_document_with_access_policy() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Add document with access policy
        ts::next_tx(scenario, OWNER);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::add_document(
                &mut registry,
                b"private.md",
                b"vector",
                b"doc",
                5,
                b"text-embedding-3-small",
                option::some(@0x123), // Mock policy address
                ts::ctx(scenario)
            );
            ts::return_shared(registry);
        };

        // Verify policy ID is stored
        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let doc_info = vector_registry::get_document_info(&registry, string::utf8(b"private.md"));
            let policy_id = vector_registry::get_access_policy_id(doc_info);

            assert!(option::is_some(&policy_id) == true, 0);
            assert!(*option::borrow(&policy_id) == @0x123, 1);

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 2)] // E_DOCUMENT_EXISTS
    fun test_add_duplicate_document_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);
        add_test_document(scenario, OWNER, b"test.md", b"vec1", b"doc1", 5);

        // Try to add same document again (should fail)
        add_test_document(scenario, OWNER, b"test.md", b"vec2", b"doc2", 5);

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 4)] // E_INVALID_CHUNK_COUNT
    fun test_add_document_zero_chunks_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Try to add document with 0 chunks (should fail)
        add_test_document(scenario, OWNER, b"test.md", b"vec", b"doc", 0);

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 3)] // E_DOCUMENT_NOT_FOUND
    fun test_update_nonexistent_document_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Try to update document that doesn't exist
        ts::next_tx(scenario, OWNER);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::update_document_vectors(
                &mut registry,
                b"nonexistent.md",
                b"vec",
                5,
                ts::ctx(scenario)
            );
            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 1)] // E_NOT_OWNER
    fun test_update_document_non_owner_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);
        add_test_document(scenario, OWNER, b"test.md", b"vec", b"doc", 5);

        // USER1 tries to update OWNER's document (should fail)
        ts::next_tx(scenario, USER1);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::update_document_vectors(
                &mut registry,
                b"test.md",
                b"new_vec",
                10,
                ts::ctx(scenario)
            );
            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = 1)] // E_NOT_OWNER
    fun test_remove_document_non_owner_fails() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);
        add_test_document(scenario, OWNER, b"test.md", b"vec", b"doc", 5);

        // USER1 tries to remove OWNER's document (should fail)
        ts::next_tx(scenario, USER1);
        {
            let mut registry = ts::take_shared<VectorRegistry>(scenario);
            vector_registry::remove_document(&mut registry, b"test.md", ts::ctx(scenario));
            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_different_users_can_add_documents() {
        let mut scenario_val = ts::begin(OWNER);
        let scenario = &mut scenario_val;

        create_test_registry(scenario);

        // Different users add their own documents
        add_test_document(scenario, OWNER, b"owner_doc.md", b"vec1", b"blob1", 5);
        add_test_document(scenario, USER1, b"user1_doc.md", b"vec2", b"blob2", 3);
        add_test_document(scenario, USER2, b"user2_doc.md", b"vec3", b"blob3", 7);

        ts::next_tx(scenario, OWNER);
        {
            let registry = ts::take_shared<VectorRegistry>(scenario);
            let (total_docs, _, _) = vector_registry::get_registry_stats(&registry);

            assert!(total_docs == 3, 0);

            // Verify ownership
            let owner_doc = vector_registry::get_document_info(&registry, string::utf8(b"owner_doc.md"));
            assert!(vector_registry::get_owner(owner_doc) == OWNER, 1);

            let user1_doc = vector_registry::get_document_info(&registry, string::utf8(b"user1_doc.md"));
            assert!(vector_registry::get_owner(user1_doc) == USER1, 2);

            ts::return_shared(registry);
        };

        ts::end(scenario_val);
    }
}
