use criterion::{criterion_group, criterion_main, Criterion};
use hackthebox_app_lib::graphs::{graph_tests::create_dynamic_chain, in_memory_graph::InMemoryGraph};

fn bench_graph_lookup(c: &mut Criterion) {
    let json_graph = create_dynamic_chain(1_000_000);
    let mut img = InMemoryGraph::from_graph_object(json_graph);

    c.bench_function("lookup last element", |b| {
        b.iter(|| {
            let result = img.find_node("scriptNode-999999");
            std::hint::black_box(result);
        })
    });

    c.bench_function("lookup by type", |b| {
        b.iter(|| {
            let result = img.find_by_type("scriptNode");
            std::hint::black_box(result);
        })
    });

    img.dispose();
}

criterion_group!(benches, bench_graph_lookup);
criterion_main!(benches);