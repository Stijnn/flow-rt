#[macro_export(local_inner_macros)]
macro_rules! implement_trait_from_json_file {
    ([$($i:ident),*]) => {
        $(
            impl $crate::schemas::helpers::JsonFile for $i {}
        )*
    };
}

/// This macro expands into: `let _ = $i;`
/// It is used to explicitly silence unused result warnings.
#[macro_export(local_inner_macros)]
macro_rules! silence {
    ($i:expr) => {
        let _ = $i;
    };
}
