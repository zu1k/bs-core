use tantivy::{
    merge_policy::{MergeCandidate, MergePolicy},
    SegmentId, SegmentMeta,
};

/// `AlwaysMergePolicy` always merges all segments.
#[derive(Debug)]
pub struct AlwaysMergePolicy;

impl MergePolicy for AlwaysMergePolicy {
    fn compute_merge_candidates(&self, segments: &[SegmentMeta]) -> Vec<MergeCandidate> {
        let segment_ids = segments
            .iter()
            .map(|segment| segment.id())
            .collect::<Vec<SegmentId>>();
        if segment_ids.len() > 1 {
            vec![MergeCandidate(segment_ids)]
        } else {
            vec![]
        }
    }
}
