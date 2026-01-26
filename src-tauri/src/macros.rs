#[macro_export(local_inner_macros)]
macro_rules! implement_trait_from_json_file {
    ([$($i:ident),*]) => {
        $(
            impl $crate::schemas::helpers::JsonFile for $i {}
        )*
    };
}