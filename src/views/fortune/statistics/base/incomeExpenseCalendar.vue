<template>
  <div class="income-expense-calendar">
    <div v-if="hasResponseData" class="income-expense-calendar__hint">
      <span
        class="income-expense-calendar__legend income-expense-calendar__legend--income"
      >
        收入
      </span>
      <span
        class="income-expense-calendar__legend income-expense-calendar__legend--expense"
      >
        支出
      </span>
      <span>金额按当前统计周期汇总</span>
    </div>
    <p
      v-if="hasResponseData"
      class="income-expense-calendar__summary"
      aria-live="polite"
    >
      {{ accessibleSummary }}
    </p>

    <section
      v-if="hasResponseData && isMonthlyDaily"
      class="income-expense-calendar__month"
      :aria-label="monthlyView.title"
    >
      <h3>{{ monthlyView.title }}</h3>
      <div class="income-expense-calendar__weekdays" aria-hidden="true">
        <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
      </div>
      <div
        class="income-expense-calendar__month-grid"
        role="grid"
        :aria-label="monthlyView.title"
      >
        <span
          v-for="day in monthlyView.leadingDays"
          :key="`leading-${day}`"
          class="income-expense-calendar__empty-day"
          role="presentation"
        />
        <template v-for="day in monthlyView.days" :key="day.period">
          <el-tooltip v-if="day.hasData" placement="top" :show-after="200">
            <template #content>
              <div class="income-expense-calendar__tooltip">
                <strong>{{ day.label }}</strong>
                <span
                  >收入：{{ formatCurrency(day.income) }}（{{
                    day.incomeCount
                  }}
                  笔）</span
                >
                <span
                  >支出：{{ formatCurrency(day.expense) }}（{{
                    day.expenseCount
                  }}
                  笔）</span
                >
                <span>净额：{{ formatCurrency(day.netIncome) }}</span>
              </div>
            </template>
            <div
              class="income-expense-calendar__day income-expense-calendar__day--has-data"
              role="gridcell"
              tabindex="0"
              :aria-label="getPeriodLabel(day)"
            >
              <time
                :datetime="day.period"
                class="income-expense-calendar__period-label"
              >
                {{ day.label }}
              </time>
              <div class="income-expense-calendar__amounts">
                <span
                  class="income-expense-calendar__amount income-expense-calendar__amount--income"
                >
                  收 {{ formatCompactCurrency(day.income) }}
                </span>
                <span
                  class="income-expense-calendar__amount income-expense-calendar__amount--expense"
                >
                  支 {{ formatCompactCurrency(day.expense) }}
                </span>
              </div>
            </div>
          </el-tooltip>
          <div
            v-else
            class="income-expense-calendar__day income-expense-calendar__day--empty"
            role="gridcell"
            :aria-label="getPeriodLabel(day)"
          >
            <time
              :datetime="day.period"
              class="income-expense-calendar__period-label"
            >
              {{ day.label }}
            </time>
            <span class="income-expense-calendar__no-data" aria-hidden="true"
              >—</span
            >
          </div>
        </template>
      </div>
    </section>

    <section
      v-else-if="hasResponseData && isYearlyMonthly"
      class="income-expense-calendar__summary-view"
      :aria-label="yearlyView.title"
    >
      <h3>{{ yearlyView.title }}</h3>
      <div
        class="income-expense-calendar__period-grid income-expense-calendar__period-grid--months"
      >
        <template v-for="item in yearlyView.items" :key="item.period">
          <el-tooltip v-if="item.hasData" placement="top" :show-after="200">
            <template #content>
              <div class="income-expense-calendar__tooltip">
                <strong>{{ item.label }}</strong>
                <span
                  >收入：{{ formatCurrency(item.income) }}（{{
                    item.incomeCount
                  }}
                  笔）</span
                >
                <span
                  >支出：{{ formatCurrency(item.expense) }}（{{
                    item.expenseCount
                  }}
                  笔）</span
                >
                <span>净额：{{ formatCurrency(item.netIncome) }}</span>
              </div>
            </template>
            <div
              class="income-expense-calendar__period-cell income-expense-calendar__period-cell--has-data"
              tabindex="0"
              :aria-label="getPeriodLabel(item)"
            >
              <time
                :datetime="item.period"
                class="income-expense-calendar__period-label"
              >
                {{ item.label }}
              </time>
              <calendar-amounts :item="item" />
            </div>
          </el-tooltip>
          <div
            v-else
            class="income-expense-calendar__period-cell income-expense-calendar__period-cell--empty"
            :aria-label="getPeriodLabel(item)"
          >
            <time
              :datetime="item.period"
              class="income-expense-calendar__period-label"
            >
              {{ item.label }}
            </time>
            <span class="income-expense-calendar__no-data">暂无记录</span>
          </div>
        </template>
      </div>
    </section>

    <section
      v-else-if="hasResponseData"
      class="income-expense-calendar__summary-view"
      :aria-label="historyView.title"
    >
      <h3>{{ historyView.title }}</h3>
      <div
        class="income-expense-calendar__period-grid income-expense-calendar__period-grid--years"
      >
        <template v-for="item in historyView.items" :key="item.period">
          <el-tooltip v-if="item.hasData" placement="top" :show-after="200">
            <template #content>
              <div class="income-expense-calendar__tooltip">
                <strong>{{ item.label }}</strong>
                <span
                  >收入：{{ formatCurrency(item.income) }}（{{
                    item.incomeCount
                  }}
                  笔）</span
                >
                <span
                  >支出：{{ formatCurrency(item.expense) }}（{{
                    item.expenseCount
                  }}
                  笔）</span
                >
                <span>净额：{{ formatCurrency(item.netIncome) }}</span>
              </div>
            </template>
            <div
              class="income-expense-calendar__period-cell income-expense-calendar__period-cell--has-data"
              tabindex="0"
              :aria-label="getPeriodLabel(item)"
            >
              <time
                :datetime="item.period"
                class="income-expense-calendar__period-label"
              >
                {{ item.label }}
              </time>
              <calendar-amounts :item="item" />
            </div>
          </el-tooltip>
          <div
            v-else
            class="income-expense-calendar__period-cell income-expense-calendar__period-cell--empty"
            :aria-label="getPeriodLabel(item)"
          >
            <time
              :datetime="item.period"
              class="income-expense-calendar__period-label"
            >
              {{ item.label }}
            </time>
            <span class="income-expense-calendar__no-data">暂无记录</span>
          </div>
        </template>
      </div>
    </section>

    <div
      v-if="hasResponseData && loading"
      class="income-expense-calendar__loading"
    >
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="loading" class="income-expense-calendar__state">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="income-expense-calendar__state">
      <el-empty description="收支日历加载失败">
        <el-button type="primary" @click="emit('retry')">重试</el-button>
      </el-empty>
    </div>
    <div v-else-if="!hasResponseData" class="income-expense-calendar__state">
      <el-empty description="当前统计范围暂无收支数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import {
  IncomeExpenseCalendarGranularity,
  type IncomeExpenseCalendarItemVo,
  type IncomeExpenseCalendarVo
} from "@/api/fortune/include";

interface CalendarPeriod {
  period: string;
  label: string;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
  netIncome: number;
  hasData: boolean;
}

interface MonthlyView {
  title: string;
  leadingDays: number;
  days: Array<CalendarPeriod>;
}

interface PeriodView {
  title: string;
  items: Array<CalendarPeriod>;
}

const props = withDefaults(
  defineProps<{
    data: IncomeExpenseCalendarVo | null;
    loading?: boolean;
    error?: boolean;
    currency?: string;
  }>(),
  {
    loading: false,
    error: false,
    currency: "CNY"
  }
);

const emit = defineEmits<{
  retry: [];
}>();

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const hasResponseData = computed(() =>
  Boolean(props.data?.startDate && props.data?.endDate)
);
const itemMap = computed(
  () => new Map((props.data?.items || []).map(item => [item.period, item]))
);
const isMonthlyDaily = computed(
  () =>
    props.data?.granularity === IncomeExpenseCalendarGranularity.MonthlyDaily
);
const isYearlyMonthly = computed(
  () =>
    props.data?.granularity === IncomeExpenseCalendarGranularity.YearlyMonthly
);

const monthlyView = computed<MonthlyView>(() => {
  const period = props.data?.startDate.slice(0, 7) || "";
  const [year, month] = period.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingDays = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  return {
    title: `${year}年${month}月收支日历`,
    leadingDays,
    days: Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dayPeriod = `${period}-${String(day).padStart(2, "0")}`;
      return createCalendarPeriod(
        dayPeriod,
        `${day}日`,
        itemMap.value.get(dayPeriod)
      );
    })
  };
});

const yearlyView = computed<PeriodView>(() => {
  const year = Number(props.data?.startDate.slice(0, 4));
  return {
    title: `${year}年月度收支`,
    items: Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const period = `${year}-${String(month).padStart(2, "0")}`;
      return createCalendarPeriod(
        period,
        `${month}月`,
        itemMap.value.get(period)
      );
    })
  };
});

const historyView = computed<PeriodView>(() => {
  const startYear = Number(props.data?.startDate.slice(0, 4));
  const endYear = Number(props.data?.endDate.slice(0, 4));
  return {
    title: `${startYear}—${endYear}年度收支`,
    items: Array.from({ length: endYear - startYear + 1 }, (_, index) => {
      const year = String(startYear + index);
      return createCalendarPeriod(year, `${year}年`, itemMap.value.get(year));
    })
  };
});

const accessibleSummary = computed(() => {
  if (isMonthlyDaily.value)
    return monthlyView.value.days.map(getPeriodLabel).join("；");
  if (isYearlyMonthly.value)
    return yearlyView.value.items.map(getPeriodLabel).join("；");
  return historyView.value.items.map(getPeriodLabel).join("；");
});

const CalendarAmounts = defineComponent({
  name: "CalendarAmounts",
  props: {
    item: {
      type: Object as () => CalendarPeriod,
      required: true
    }
  },
  setup(componentProps) {
    return () =>
      h("div", { class: "income-expense-calendar__amounts" }, [
        h(
          "span",
          {
            class:
              "income-expense-calendar__amount income-expense-calendar__amount--income"
          },
          `收 ${formatCompactCurrency(componentProps.item.income)}`
        ),
        h(
          "span",
          {
            class:
              "income-expense-calendar__amount income-expense-calendar__amount--expense"
          },
          `支 ${formatCompactCurrency(componentProps.item.expense)}`
        )
      ]);
  }
});

function createCalendarPeriod(
  period: string,
  label: string,
  item?: IncomeExpenseCalendarItemVo
): CalendarPeriod {
  const income = item?.income || 0;
  const expense = item?.expense || 0;
  return {
    period,
    label,
    income,
    expense,
    incomeCount: item?.incomeCount || 0,
    expenseCount: item?.expenseCount || 0,
    netIncome: income - expense,
    hasData: Boolean(item)
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency,
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function getPeriodLabel(item: CalendarPeriod) {
  return `${item.label}：收入 ${formatCurrency(item.income)}，${item.incomeCount} 笔；支出 ${formatCurrency(item.expense)}，${item.expenseCount} 笔；净额 ${formatCurrency(item.netIncome)}`;
}
</script>

<style scoped lang="scss">
.income-expense-calendar {
  --calendar-income: var(--el-color-success);
  --calendar-expense: var(--el-color-danger);
  --calendar-divider: var(--el-border-color-lighter);
  --calendar-muted: var(--el-text-color-secondary);
  --calendar-hover: var(--el-fill-color-light);

  position: relative;
}

.income-expense-calendar__hint {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--calendar-muted);
}

.income-expense-calendar__legend {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-weight: 600;
}

.income-expense-calendar__legend::before,
:deep(.income-expense-calendar__amount)::before {
  width: 3px;
  height: 1em;
  content: "";
  border-radius: 999px;
}

.income-expense-calendar__legend--income::before,
:deep(.income-expense-calendar__amount--income)::before {
  background: var(--calendar-income);
}

.income-expense-calendar__legend--expense::before,
:deep(.income-expense-calendar__amount--expense)::before {
  background: var(--calendar-expense);
}

.income-expense-calendar__summary {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

.income-expense-calendar h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.income-expense-calendar__weekdays,
.income-expense-calendar__month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.income-expense-calendar__weekdays {
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--calendar-muted);
  text-align: center;
}

.income-expense-calendar__day,
.income-expense-calendar__empty-day {
  min-width: 0;
  min-height: 88px;
}

.income-expense-calendar__day {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 9px 10px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--calendar-divider);
  border-radius: 6px;
}

.income-expense-calendar__day--has-data,
.income-expense-calendar__period-cell--has-data {
  cursor: default;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.income-expense-calendar__day--has-data:hover,
.income-expense-calendar__day--has-data:focus-visible,
.income-expense-calendar__period-cell--has-data:hover,
.income-expense-calendar__period-cell--has-data:focus-visible {
  outline: none;
  background: var(--calendar-hover);
  border-color: var(--el-color-primary-light-5);
}

.income-expense-calendar__day--empty,
.income-expense-calendar__period-cell--empty {
  color: var(--calendar-muted);
  background: var(--el-fill-color-lighter);
}

.income-expense-calendar__period-label {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.income-expense-calendar__amounts,
:deep(.income-expense-calendar__amounts) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.income-expense-calendar__amount,
:deep(.income-expense-calendar__amount) {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  min-width: 0;
  font-size: 12px;
  line-height: 1.1;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.income-expense-calendar__amount--income,
:deep(.income-expense-calendar__amount--income) {
  color: var(--calendar-income);
}

.income-expense-calendar__amount--expense,
:deep(.income-expense-calendar__amount--expense) {
  color: var(--calendar-expense);
}

.income-expense-calendar__no-data {
  font-size: 12px;
  color: var(--calendar-muted);
}

.income-expense-calendar__summary-view {
  padding-top: 2px;
}

.income-expense-calendar__period-grid {
  display: grid;
  gap: 8px;
}

.income-expense-calendar__period-grid--months {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.income-expense-calendar__period-grid--years {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.income-expense-calendar__period-cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  min-height: 88px;
  padding: 12px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--calendar-divider);
  border-radius: 6px;
}

.income-expense-calendar__tooltip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.5;
}

.income-expense-calendar__state,
.income-expense-calendar__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: 24px;
}

.income-expense-calendar__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgb(255 255 255 / 72%);
}

@media (width <= 1200px) {
  .income-expense-calendar__day,
  .income-expense-calendar__empty-day {
    min-height: 74px;
  }

  .income-expense-calendar__period-grid--months {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .income-expense-calendar__period-grid--years {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (width <= 768px) {
  .income-expense-calendar__hint {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 12px;
  }

  .income-expense-calendar h3 {
    margin-bottom: 12px;
    font-size: 15px;
  }

  .income-expense-calendar__weekdays,
  .income-expense-calendar__month-grid {
    gap: 3px;
  }

  .income-expense-calendar__day,
  .income-expense-calendar__empty-day {
    min-height: 60px;
  }

  .income-expense-calendar__day {
    padding: 6px 4px;
  }

  .income-expense-calendar__period-label {
    font-size: 12px;
  }

  .income-expense-calendar__amounts {
    gap: 3px;
  }

  .income-expense-calendar__amount,
  :deep(.income-expense-calendar__amount),
  .income-expense-calendar__no-data {
    gap: 3px;
    font-size: 11px;
  }

  .income-expense-calendar__period-grid--months,
  .income-expense-calendar__period-grid--years {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .income-expense-calendar__period-cell {
    min-height: 82px;
    padding: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .income-expense-calendar__day--has-data,
  .income-expense-calendar__period-cell--has-data {
    transition: none;
  }
}
</style>
