-- users: 채널 사용자 동의/가입 기준
create table if not exists users (
  kakao_user_id text primary key,
  consent_at timestamptz,
  created_at timestamptz default now()
);

-- otps: OTP 발급 이력
create table if not exists otps (
  id bigserial primary key,
  kakao_user_id text not null references users(kakao_user_id),
  otp text not null,
  expires_at timestamptz not null,
  issued_at timestamptz default now()
);
create index if not exists idx_otps_user_time on otps(kakao_user_id, issued_at desc);

-- tokens: 사전채움 접근 토큰 (1회/단기)
create table if not exists tokens (
  id bigserial primary key,
  kakao_user_id text not null references users(kakao_user_id),
  token text not null unique,
  issued_at timestamptz default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);
create index if not exists idx_tokens_user_time on tokens(kakao_user_id, issued_at desc);

