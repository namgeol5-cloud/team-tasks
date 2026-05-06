-- 1. 외래 키 컬럼 추가
alter table tasks
  add column if not exists assignee_id uuid references auth.users(id) on delete set null,
  add column if not exists created_by  uuid references auth.users(id) on delete cascade;

-- 2. 인증 전 삽입된 row 제거 후 created_by not null 강화
delete from tasks where created_by is null;

alter table tasks
  alter column created_by set not null;

-- 3. 임시 전체 접근 정책 제거
drop policy if exists temp_all_access on tasks;

-- 4. 정식 RLS 정책 4종
create policy tasks_select on tasks
  for select
  using (
    auth.uid() = created_by or
    auth.uid() = assignee_id
  );

create policy tasks_insert on tasks
  for insert
  with check (auth.uid() = created_by);

create policy tasks_update on tasks
  for update
  using (
    auth.uid() = created_by or
    auth.uid() = assignee_id
  );

create policy tasks_delete on tasks
  for delete
  using (auth.uid() = created_by);
