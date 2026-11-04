'use client';
import { useState, type FormEvent } from 'react';
import { ImagePlus, Plus, Save, Trash2, ArrowRight, Info } from 'lucide-react';
import { useApp } from './provider';
import { Field, Modal } from './ui';
import type { RaceEvent } from '@/lib/types';
import { seedEvents, sports } from '@/lib/data';
import { asset, states, uid } from '@/lib/utils';

export function EventEditor({ event, onClose }: { event?: RaceEvent; onClose: () => void }) {
  const { db, session, update, toast } = useApp();
  const [draft, setDraft] = useState<RaceEvent>(
    event
      ? structuredClone(event)
      : {
          ...seedEvents[0],
          serviceFee: db.settings.fee,
          id: uid('evento'),
          name: '',
          subtitle: '',
          description: '',
          date: '2027-02-07',
          registrationEnd: '2027-02-01',
          status: 'Rascunho',
          organizerId: session?.organizerId || 'org-1',
          featured: false,
          createdAt: new Date().toISOString().slice(0, 10),
          distances: [{ name: '5 km', price: 79, capacity: 200 }],
          capacity: 200,
        },
  );
  const [tab, setTab] = useState(0),
    [error, setError] = useState('');
  const set = <K extends keyof RaceEvent>(key: K, value: RaceEvent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (
      !draft.name.trim() ||
      !draft.date ||
      !draft.city.trim() ||
      !draft.venue.trim() ||
      !draft.description.trim()
    ) {
      setError('Preencha nome, data, cidade, local e descrição na aba Informações.');
      setTab(0);
      return;
    }
    if (draft.registrationEnd > draft.date) {
      setError('O encerramento das inscrições deve ser até a data da prova.');
      setTab(0);
      return;
    }
    if (
      !draft.distances.length ||
      draft.distances.some((d) => !d.name.trim() || d.price < 0 || d.capacity < 1)
    ) {
      setError('Cadastre pelo menos uma modalidade com nome, valor e vagas válidos.');
      setTab(1);
      return;
    }
    if (
      new Set(draft.distances.map((d) => d.name.trim().toLowerCase())).size !==
      draft.distances.length
    ) {
      setError('As modalidades precisam ter nomes distintos.');
      setTab(1);
      return;
    }
    const existing = db.registrations.filter(
      (r) => r.eventId === draft.id && r.status !== 'Cancelada',
    );
    if (existing.some((r) => !draft.distances.some((d) => d.name === r.distance))) {
      setError('Não remova ou renomeie uma modalidade com inscrições ativas.');
      setTab(1);
      return;
    }
    if (
      draft.distances.some((d) => existing.filter((r) => r.distance === d.name).length > d.capacity)
    ) {
      setError('O limite de vagas não pode ser menor que as inscrições ativas.');
      setTab(1);
      return;
    }
    const clean = {
      ...draft,
      name: draft.name.trim(),
      capacity: draft.distances.reduce((s, d) => s + d.capacity, 0),
    };
    update(
      (d) => ({
        ...d,
        events: event ? d.events.map((e) => (e.id === clean.id ? clean : e)) : [clean, ...d.events],
      }),
      `Evento ${clean.name} ${event ? 'atualizado' : 'criado'} · ${clean.status}`,
    );
    toast(
      event
        ? 'Evento atualizado nesta demonstração.'
        : 'Evento criado. Publique quando estiver pronto.',
    );
    onClose();
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      toast('Escolha uma imagem de até 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set('image', String(reader.result));
      toast('Capa carregada apenas neste navegador.');
    };
    reader.readAsDataURL(file);
  }
  return (
    <Modal title={event ? 'Editar evento' : 'Um novo ponto de partida'} onClose={onClose} wide>
      <form onSubmit={save} noValidate>
        <div className="editor-tabs">
          {['Informações', 'Modalidades e valores', 'Kit e publicação'].map((t, i) => (
            <button
              type="button"
              key={t}
              className={tab === i ? 'active' : ''}
              onClick={() => setTab(i)}
            >
              <span>{i + 1}</span>
              {t}
            </button>
          ))}
        </div>
        {tab === 0 && (
          <div className="section-stack">
            <div className="editor-cover">
              <img
                src={draft.image.startsWith('data:') ? draft.image : asset(draft.image)}
                alt="Prévia da capa"
              />
              <label className="button button-outline button-small">
                <ImagePlus size={15} />
                Trocar capa
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="form-grid">
              <Field label="Nome do evento *" full>
                <input
                  value={draft.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Como vai se chamar a próxima conquista?"
                  maxLength={90}
                />
              </Field>
              <Field label="Subtítulo" full>
                <input
                  value={draft.subtitle}
                  onChange={(e) => set('subtitle', e.target.value)}
                  maxLength={120}
                />
              </Field>
              <Field label="Modalidade esportiva">
                <select
                  value={draft.sport}
                  onChange={(e) => set('sport', e.target.value as RaceEvent['sport'])}
                >
                  {sports.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              {session?.role === 'admin' && (
                <Field label="Organizador">
                  <select
                    value={draft.organizerId}
                    onChange={(e) => set('organizerId', e.target.value)}
                  >
                    {db.organizers
                      .filter((o) => o.status === 'Aprovado')
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                  </select>
                </Field>
              )}
              <Field label="Data do evento *">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </Field>
              <Field label="Horário da largada">
                <input
                  type="time"
                  value={draft.time}
                  onChange={(e) => set('time', e.target.value)}
                />
              </Field>
              <Field label="Inscrições até">
                <input
                  type="date"
                  value={draft.registrationEnd}
                  onChange={(e) => set('registrationEnd', e.target.value)}
                />
              </Field>
              <Field label="Abertura das inscrições">
                <input
                  type="date"
                  value={draft.registrationStart || ''}
                  onChange={(e) => set('registrationStart', e.target.value || undefined)}
                />
              </Field>
              <Field label="Cidade *">
                <input value={draft.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="Estado">
                <select value={draft.state} onChange={(e) => set('state', e.target.value)}>
                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Local de largada *" full>
                <input value={draft.venue} onChange={(e) => set('venue', e.target.value)} />
              </Field>
              <Field label="Descrição do evento *" full>
                <textarea
                  value={draft.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                />
              </Field>
              <Field label="WhatsApp do evento (link)">
                <input
                  type="url"
                  placeholder="https://wa.me/55..."
                  value={draft.whatsapp || ''}
                  onChange={(e) => set('whatsapp', e.target.value || undefined)}
                />
              </Field>
              <Field label="Rota no Strava (link)">
                <input
                  type="url"
                  placeholder="https://www.strava.com/routes/..."
                  value={draft.strava || ''}
                  onChange={(e) => set('strava', e.target.value || undefined)}
                />
              </Field>
            </div>
          </div>
        )}
        {tab === 1 && (
          <>
            <p className="section-description">
              Defina distâncias, valores e vagas. As categorias são calculadas pela idade na data da
              prova e pelo sexo do atleta (faixas de 10 anos, a partir de 16 anos).
            </p>
            <div className="distance-editor-head">
              <span>Distância / modalidade</span>
              <span>Valor (R$)</span>
              <span>Vagas</span>
              <span />
            </div>
            {draft.distances.map((d, i) => (
              <div className="distance-editor-row" key={i}>
                <input
                  aria-label={`Nome da modalidade ${i + 1}`}
                  value={d.name}
                  onChange={(e) =>
                    set(
                      'distances',
                      draft.distances.map((x, j) => (i === j ? { ...x, name: e.target.value } : x)),
                    )
                  }
                />
                <input
                  aria-label={`Valor da modalidade ${i + 1}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={d.price}
                  onChange={(e) =>
                    set(
                      'distances',
                      draft.distances.map((x, j) =>
                        i === j ? { ...x, price: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
                <input
                  aria-label={`Vagas da modalidade ${i + 1}`}
                  type="number"
                  min="1"
                  value={d.capacity}
                  onChange={(e) =>
                    set(
                      'distances',
                      draft.distances.map((x, j) =>
                        i === j ? { ...x, capacity: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="icon-button text-danger"
                  aria-label={`Remover modalidade ${i + 1}`}
                  onClick={() =>
                    set(
                      'distances',
                      draft.distances.filter((_, j) => j !== i),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button button-outline button-small spaced"
              onClick={() =>
                set('distances', [...draft.distances, { name: '', price: 0, capacity: 100 }])
              }
            >
              <Plus size={15} />
              Adicionar modalidade
            </button>
            <hr className="divider" />
            <div className="form-grid">
              <Field label="Taxa de serviço (%)">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={draft.serviceFee}
                  onChange={(e) =>
                    set('serviceFee', Math.max(0, Math.min(30, Number(e.target.value))))
                  }
                />
              </Field>
              <Field label="Quem paga a taxa?">
                <select
                  value={draft.feePayer}
                  onChange={(e) => set('feePayer', e.target.value as RaceEvent['feePayer'])}
                >
                  <option value="atleta">Atleta · adicionada ao valor</option>
                  <option value="organizador">Organizador · descontada do repasse</option>
                </select>
              </Field>
              <Field label="Máximo de parcelas no cartão">
                <select
                  value={draft.installments}
                  onChange={(e) => set('installments', Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option value={n} key={n}>
                      {n}x sem juros (simulação)
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="info-message spaced">
              <Info size={17} />
              Mudanças de preço e taxa valem para novas inscrições. Os pagamentos existentes mantêm
              os valores originais.
            </div>
          </>
        )}
        {tab === 2 && (
          <div className="section-stack">
            <div className="form-grid">
              <Field label="Orientações para retirada do kit" full>
                <textarea
                  value={draft.kitPickup}
                  onChange={(e) => set('kitPickup', e.target.value)}
                  rows={3}
                />
              </Field>
              <Field label="Situação do evento">
                <select
                  value={draft.status}
                  onChange={(e) => set('status', e.target.value as RaceEvent['status'])}
                >
                  {['Rascunho', 'Inscrições abertas', 'Em breve', 'Encerrado'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Capa de exemplo">
                <select
                  value={draft.image.startsWith('data:') ? 'custom' : draft.image}
                  onChange={(e) => set('image', e.target.value)}
                >
                  <option value="/images/running.jpg">Corrida de rua</option>
                  <option value="/images/trail.jpg">Trail e montanha</option>
                  <option value="/images/cycling.jpg">MTB</option>
                  <option value="/images/road-bike.jpg">Ciclismo</option>
                  <option value="/images/swimming.jpg">Triathlon</option>
                  {draft.image.startsWith('data:') && (
                    <option value="custom">Imagem enviada</option>
                  )}
                </select>
              </Field>
            </div>
            <div className="info-message">
              <Info size={17} />
              Kit Essencial incluso. Kit Completo com sacochila e squeeze por R$ 35 adicionais.
              Camisetas PP a XGG. Configuração simplificada para demonstração.
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={draft.publicList}
                onChange={(e) => set('publicList', e.target.checked)}
              />
              Permitir lista pública de inscritos (somente nome, distância e categoria)
            </label>
            <p className="modal-hint">
              O evento aparece no catálogo ao sair do status Rascunho. Publicar só altera os dados
              locais desta demo.
            </p>
          </div>
        )}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <div className="form-actions">
          <button className="button button-ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          {tab < 2 && (
            <button className="button button-outline" type="button" onClick={() => setTab(tab + 1)}>
              Próxima etapa
              <ArrowRight size={15} />
            </button>
          )}
          <button className="button button-primary" type="submit">
            <Save size={15} />
            Salvar evento
          </button>
        </div>
      </form>
    </Modal>
  );
}
