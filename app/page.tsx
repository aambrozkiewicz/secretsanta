import { Button } from '@/components/button';
import { getExchange } from '@/lib/actions';
import { Organizer } from '@/components/organizer';
import { DeliveryStatus } from '@/components/delivery-status';
import { Eyebrow, sheet } from '@/components/ui';
import { Mail, ArrowUpRight, Sparkles, LockKeyhole, Check, Moon } from 'lucide-react';
import Image from 'next/image';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const exchange = await getExchange();
  if (exchange) {
    const sent = exchange.mail.filter((m) => m.sentAt).length;
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div className="mb-8 flex items-center justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <Eyebrow>ŚWIĄTECZNA WYMIANA PREZENTÓW</Eyebrow>
            <h1 className="mt-4 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Sekrety są już rozdane.
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              Każdy otrzyma swój prywatny link. Wyniki pozostają tajemnicą.
            </p>
          </div>
          <div
            className="gift-stage flex size-20 shrink-0 items-center justify-center sm:size-28"
            aria-hidden="true"
          >
            <Image
              src="/gift.svg"
              width={96}
              height={96}
              loading="eager"
              alt=""
              className="gift-float size-16 sm:size-20"
            />
          </div>
        </div>
        <section className={sheet}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Wasza lista</h2>
            <span className="text-xs text-muted">
              {exchange.people.length} os.
            </span>
          </div>
          {exchange.people.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b border-line py-4 sm:gap-4"
            >
              <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-soft text-burgundy sm:grid">
                {p.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{p.name}</p>
                <p className="mt-1 break-all text-xs text-muted">{p.email}</p>
              </div>
              <div className="flex w-36 shrink-0 flex-wrap justify-end gap-2 text-right text-[11px] leading-4 sm:w-auto sm:max-w-[60%] sm:text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${p.openedAt || p.revision > 0 ? 'bg-gold/10 text-gold' : 'bg-cream text-muted'}`}
                >
                  {p.openedAt || p.revision > 0 ? (
                    <Check aria-hidden="true" className="size-3.5 shrink-0" />
                  ) : (
                    <Moon aria-hidden="true" className="size-3.5 shrink-0" />
                  )}
                  {p.openedAt || p.revision > 0
                    ? 'Link otwarty'
                    : 'Link jeszcze nieotwarty'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${p.revision > 0 ? 'bg-gold/10 text-gold' : 'bg-cream text-muted'}`}
                >
                  {p.revision > 0 ? (
                    <Check aria-hidden="true" className="size-3.5 shrink-0" />
                  ) : (
                    <Moon aria-hidden="true" className="size-3.5 shrink-0" />
                  )}
                  {p.revision > 0
                    ? 'List zapisany'
                    : 'List jeszcze nieuzupełniony'}
                </span>
              </div>
            </div>
          ))}
          <div className="mt-6 flex items-center gap-2 text-sm justify-between">
            <div className="flex items-center gap-1.5">
              <Mail className="size-4 shrink-0 text-burgundy" /> Wysłane
              zaproszenia: {sent} z {exchange.mail.length}
            </div>
            <div>
<DeliveryStatus pending={exchange.mail.length - sent} />
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-muted">
            Dostęp organizatora jest zapisany w tej przeglądarce. Zachowaj jej
            pliki cookie, aby móc ponowić wysyłkę.
          </p>
        </section>
      </div>
    );
  }
  return (
    <>
      <section
        aria-label="Świąteczne losowanie Secret Santa"
        className="flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)]"
      >
        <div className="grid flex-1 items-center gap-4 pb-10 pt-3 sm:pb-14 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:py-12">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted">
              <Sparkles className="size-3.5 text-gold" aria-hidden="true" />{' '}
              Odrobina magii. Całkiem za darmo.
            </div>
            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-.055em] sm:text-6xl lg:text-[68px]">
              Od Ciebie
              <br />
              zaczyna się
              <br />
              <span className="text-burgundy">świąteczna magia.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-muted sm:text-base sm:leading-8">
              Najlepsze prezenty zaczynają się od myśli o kimś bliskim. Zbierz
              swoją ekipę. My wylosujemy resztę.
            </p>
            <Button href="#wasza-lista" className="mt-7">
              Zorganizuj losowanie{' '}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <LockKeyhole className="size-3.5" aria-hidden="true" /> Bez konta.
              Bez zdradzania sekretów.
            </p>
          </div>
          <div
            className="gift-stage relative isolate mx-auto flex min-h-80 w-full max-w-md items-center justify-center sm:min-h-96 lg:min-h-[440px]"
            aria-hidden="true"
          >
            <div className="absolute size-64 rounded-full border border-gold/15 sm:size-80" />
            <div className="absolute size-80 rounded-full border border-gold/10 sm:size-96" />
            <span className="absolute top-14 left-16 text-3xl text-gold">
              ✦
            </span>
            <span className="absolute right-10 bottom-24 text-2xl text-burgundy">
              ✧
            </span>
            <span className="absolute top-24 right-12 text-sm text-gold">
              ✦
            </span>
            <Image
              src="/gift.svg"
              width={240}
              height={240}
              priority
              alt=""
              className="gift-float relative z-10 size-48 sm:size-60"
            />
            <div className="absolute top-5 right-1 rotate-6 rounded-xl border border-line bg-white px-4 py-3 text-xs shadow-sm sm:top-9">
              <span className="mr-2 text-burgundy">♥</span> Dla kogoś
              wyjątkowego
            </div>
            <div className="absolute bottom-7 left-0 -rotate-6 rounded-xl border border-line bg-white px-4 py-3 text-xs shadow-sm sm:bottom-12">
              <span className="mr-2">✉</span> Twój sekret czeka w skrzynce
            </div>
          </div>
        </div>
      </section>
      <section
        id="wasza-lista"
        aria-labelledby="draw-heading"
        className="rounded-[2rem] bg-[#f0f0f0] px-4 py-9 sm:px-8 sm:py-12 lg:px-12"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>WIELKA RADOŚĆ ZACZYNA SIĘ OD MAŁEJ LISTY</Eyebrow>
              <h2
                id="draw-heading"
                className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Kto w tym roku zostanie Mikołajem?
              </h2>
            </div>
            <span className="text-xs text-muted">
              Zaproś co najmniej 2 osoby
            </span>
          </div>
          <Organizer
            passwordRequired={
              Boolean(process.env.ORGANIZER_PASSWORD) ||
              process.env.NODE_ENV === 'production'
            }
          />
          <p className="mt-6 text-center text-xs leading-6 text-muted">
            Mniej zgadywania. Więcej trafionych prezentów.
            <br />
            Każdy może napisać swój list do Mikołaja.
          </p>
        </div>
      </section>
    </>
  );
}
