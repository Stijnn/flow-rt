use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::Number;

#[derive(Serialize, Deserialize, JsonSchema)]
pub(crate) enum Operation {
    Sum(Number, Number),
    Subtract(Number, Number),
    Multiply(Number, Number),
    Divide(Number, Number),
    Abs(Number),
    SquareRoot(Number),
    Sin(Number),
    Floor(Number),
    Ceil(Number)
}

#[derive(Serialize, Deserialize, JsonSchema)]
pub(crate) struct MathOperation {
    operation: Operation
}

macro_rules! numb {
    ($e:expr) => {
        $e.as_f64().ok_or_else(|| anyhow::anyhow!("Value is not a valid number"))?
    };
}

macro_rules! register_math {
    (
        $ctx:expr,
        [
            $( $variant:ident ( $($arg:ident),+ ) => $kind:ident $val:tt ),* $(,)?
        ]
    ) => {{
        match $ctx.operation {
            $(
                Operation::$variant( $($arg),+ ) => {
                    register_math!(@body $kind $val $($arg),+)
                }
            ),*,
            _ => Err(anyhow::anyhow!("Operation not implemented")),
        }
    }};

    (@body op $op:tt $l:ident, $r:ident) => {{
        let left = numb!($l);
        let right = numb!($r);
        Ok(left $op right)
    }};

    (@body call $func:ident $n:ident) => {{
        let val = numb!($n);
        Ok(val.$func())
    }};
}

pub(crate) fn impl_do_math_op(ctx: MathOperation) -> anyhow::Result<()> {
    let result = register_math!(ctx, [
        Sum(l, r)        => op +,
        Subtract(l, r)   => op -,
        Multiply(l, r)   => op *,
        Divide(l, r)     => op /,
        Abs(n)           => call abs,
        SquareRoot(n)    => call sqrt,
        Sin(n)           => call sin,
        Floor(n)         => call floor,
    ])?;

    println!("Result: {}", result);
    Ok(())
}

#[cfg(test)]
mod test {
    use serde_json::Number;

    use crate::pipelines::math::{Operation, impl_do_math_op};

    #[test]
    fn impl_do_math_op_correct_input() {
        let sum_op = Operation::Sum(Number::from_f64(10f64).unwrap(), Number::from_f64(10f64).unwrap());
        let r = impl_do_math_op(super::MathOperation {
            operation: sum_op
        });

        assert!(r.is_ok());
    }
}