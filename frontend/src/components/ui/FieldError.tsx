interface FieldErrorProps {
    error?: string;
    touched?: boolean;
}

const FieldError = ({ error, touched = true }: FieldErrorProps) => {
    const mostrar = Boolean(error && touched);

    return (
        <p
            className={`
                mt-1.5 min-h-[18px] text-xs font-medium text-error
                transition-opacity duration-150
                ${mostrar ? 'opacity-100' : 'opacity-0'}
            `}
            aria-live="polite"
        >
            {mostrar ? error : '\u00A0'}
        </p>
    );
};

export default FieldError;
