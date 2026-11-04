'use client';
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  Bike,
  Footprints,
  Mountain,
  Waves,
  X,
  Search,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

export const sportIcons: Record<string, LucideIcon> = {
  'Corrida de Rua': Footprints,
  MTB: Mountain,
  Ciclismo: Bike,
  'Trail Run': Mountain,
  Triathlon: Waves,
};
export function SportIcon({ sport, size = 18 }: { sport: string; size?: number }) {
  const Icon = sportIcons[sport] || Footprints;
  return <Icon size={size} />;
}
export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const s = String(children);
  const color =
    tone ||
    (['Confirmada', 'Inscrições abertas', 'Aprovado', 'Recebido', 'Ativo'].includes(s)
      ? 'green'
      : ['Pendente', 'Programado', 'Em análise'].includes(s)
        ? 'amber'
        : ['Cancelada', 'Encerrado', 'Inativo'].includes(s)
          ? 'gray'
          : 'blue');
  return (
    <span className={`badge ${color}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function EmptyState({
  title = 'Nenhum resultado encontrado',
  text = 'Tente ajustar os filtros para encontrar o que procura.',
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Search size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  className = '',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = ref.current;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'wide' : ''} ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-inner">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Fechar janela" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
  full = false,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  full?: boolean;
}) {
  const labelId = useId();
  const hintId = `${labelId}-hint`;
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span id={labelId}>{label}</span>
      {Children.map(children, (child) =>
        isValidElement(child) &&
        typeof child.type === 'string' &&
        ['input', 'select', 'textarea'].includes(child.type)
          ? cloneElement(child as ReactElement<Record<string, unknown>>, {
              'aria-labelledby': labelId,
              'aria-describedby': hint ? hintId : undefined,
            })
          : child,
      )}
      {hint && <small id={hintId}>{hint}</small>}
    </label>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-actions">{action}</div>}
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <strong className={String(value).startsWith('R$') ? 'money-value' : undefined}>
        {value}
      </strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = 'Buscar...',
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="search-box">
      <Search size={18} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder}
      />
    </div>
  );
}
export function Panel({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
export function FilterLabel() {
  return (
    <span className="filter-label">
      <SlidersHorizontal size={16} /> Filtros
    </span>
  );
}
