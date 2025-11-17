// Sui Move Smart Contract for Metadata Registry
// Stores user metadata blob IDs for chat persistence across server restarts

module WalRag::metadata_registry {
    use sui::event;
    use std::string::String;

    /// Event emitted when metadata is updated
    public struct MetadataUpdated has copy, drop {
        user_address: address,
        metadata_blob_id: String,
        timestamp: u64,
    }

    /// Update metadata blob ID for a user
    /// This emits an event that can be queried later
    public entry fun update_metadata(
        user_address: address,
        metadata_blob_id: String,
        ctx: &mut TxContext
    ) {
        // Emit event with user address and blob ID
        event::emit(MetadataUpdated {
            user_address,
            metadata_blob_id,
            timestamp: ctx.epoch(),
        });
    }
}
