"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import type {
  MetaAdAccount,
  MetaAdsAd,
  MetaAdsAdSet,
  MetaAdsCampaign,
} from "@/lib/meta-ads-types";
import { META_UTM_TEMPLATES } from "@/lib/meta-ads-types";
import { adminConfig } from "@/lib/admin-config";
import {
  loadVisibleColumns,
  resolveColumns,
  saveVisibleColumns,
  type MetaTableContext,
  type MetaTableRow,
} from "@/lib/meta-ads-columns";
import { MetaColumnPicker } from "@/components/admin/MetaColumnPicker";
import { MetaManagerTable } from "@/components/admin/MetaManagerTable";
import { MetaSummaryPanel } from "@/components/admin/MetaSummaryPanel";

type Tab = "summary" | "manager" | "accounts" | "utms";
type ManagerLevel = "campaigns" | "adsets" | "ads";
type StatusFilter = "all" | "ACTIVE" | "PAUSED";

const DATE_PRESETS = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "last_7d", label: "Últimos 7 dias" },
  { id: "last_30d", label: "Últimos 30 dias" },
];

const MANAGER_TABS: { id: ManagerLevel; label: string }[] = [
  { id: "campaigns", label: "Campanhas" },
  { id: "adsets", label: "Conjuntos" },
  { id: "ads", label: "Anúncios" },
];

export function MetaAdsView() {
  const [tab, setTab] = useState<Tab>("manager");
  const [managerLevel, setManagerLevel] = useState<ManagerLevel>("campaigns");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [accounts, setAccounts] = useState<MetaAdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<MetaAdsCampaign[]>([]);
  const [adSets, setAdSets] = useState<MetaAdsAdSet[]>([]);
  const [ads, setAds] = useState<MetaAdsAd[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [selectedAdSetId, setSelectedAdSetId] = useState("");
  const [selectedAdSetName, setSelectedAdSetName] = useState("");
  const [datePreset, setDatePreset] = useState("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [levelLoading, setLevelLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  useEffect(() => {
    setVisibleColumnIds(loadVisibleColumns(managerLevel));
  }, [managerLevel]);

  useEffect(() => {
    if (!selectedAccountId) return;
    const params = new URLSearchParams({
      accountId: selectedAccountId,
      datePreset,
    });
    fetch(`/api/admin/meta/summary?${params}`)
      .then((res) => res.json())
      .then((json) => {
        const paid = json.summary?.paidOrders ?? 0;
        const rev = json.summary?.netRevenue ?? 0;
        setAvgOrderValue(paid > 0 ? rev / paid : 0);
      })
      .catch(() => setAvgOrderValue(0));
  }, [selectedAccountId, datePreset]);

  const selectedAccount = accounts.find((a) => a.accountId === selectedAccountId);

  const tableContext = useMemo<MetaTableContext>(
    () => ({
      avgOrderValue,
      cogsPercent: adminConfig.cogsPercent,
      paymentFeePercent: adminConfig.paymentFeePercent,
      shippingPerOrder: adminConfig.shippingCostPerOrder,
      accountStatus: selectedAccount?.accountStatus,
      accountTotalSpent: selectedAccount?.amountSpent,
    }),
    [avgOrderValue, selectedAccount]
  );

  const activeColumns = useMemo(
    () => resolveColumns(managerLevel, visibleColumnIds),
    [managerLevel, visibleColumnIds]
  );

  const handleColumnsChange = (ids: string[]) => {
    setVisibleColumnIds(ids);
    saveVisibleColumns(managerLevel, ids);
  };

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/admin/meta/status");
    const json = await res.json();
    setConfigured(json.configured ?? false);
    setStatusMessage(json.message ?? "");
  }, []);

  const loadAccounts = useCallback(async (sync = true) => {
    const res = await fetch(`/api/admin/meta/accounts${sync ? "" : "?sync=0"}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Erro ao carregar contas.");
    setConfigured(json.configured ?? false);
    if (json.message) setStatusMessage(json.message);
    const list: MetaAdAccount[] = json.accounts ?? [];
    setAccounts(list);
    const selected =
      list.find((a) => a.isSelected)?.accountId ?? list[0]?.accountId ?? "";
    setSelectedAccountId((prev) => prev || selected);
    return selected;
  }, []);

  const loadCampaigns = useCallback(
    async (accountId: string, sync = true) => {
      if (!accountId) {
        setCampaigns([]);
        return;
      }
      const res = await fetch(
        `/api/admin/meta/campaigns?accountId=${encodeURIComponent(accountId)}&datePreset=${datePreset}${sync ? "" : "&sync=0"}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao carregar campanhas.");
      setCampaigns(json.campaigns ?? []);
    },
    [datePreset]
  );

  const loadAdSets = useCallback(
    async (accountId: string, campaignId?: string) => {
      if (!accountId) {
        setAdSets([]);
        return;
      }
      const params = new URLSearchParams({
        accountId,
        datePreset,
      });
      if (campaignId) params.set("campaignId", campaignId);
      const res = await fetch(`/api/admin/meta/adsets?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao carregar conjuntos.");
      setAdSets(json.adSets ?? []);
    },
    [datePreset]
  );

  const loadAds = useCallback(
    async (accountId: string, adSetId?: string) => {
      if (!accountId) {
        setAds([]);
        return;
      }
      const params = new URLSearchParams({
        accountId,
        datePreset,
      });
      if (adSetId) params.set("adSetId", adSetId);
      const res = await fetch(`/api/admin/meta/ads?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao carregar anúncios.");
      setAds(json.ads ?? []);
    },
    [datePreset]
  );

  const loadManagerLevel = useCallback(
    async (level: ManagerLevel, accountId: string, sync = true) => {
      if (!accountId) return;
      setLevelLoading(true);
      try {
        if (level === "campaigns") {
          await loadCampaigns(accountId, sync);
        } else if (level === "adsets") {
          await loadAdSets(
            accountId,
            selectedCampaignId || undefined
          );
        } else {
          await loadAds(accountId, selectedAdSetId || undefined);
        }
      } finally {
        setLevelLoading(false);
      }
    },
    [
      loadCampaigns,
      loadAdSets,
      loadAds,
      selectedCampaignId,
      selectedAdSetId,
    ]
  );

  const refreshAll = useCallback(
    async (sync = true) => {
      setSyncing(true);
      setError("");
      try {
        const accountId = await loadAccounts(sync);
        if (accountId) {
          await loadManagerLevel(managerLevel, accountId, sync);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao sincronizar.");
      } finally {
        setSyncing(false);
        setLoading(false);
      }
    },
    [loadAccounts, loadManagerLevel, managerLevel]
  );

  useEffect(() => {
    loadStatus().then(() => refreshAll(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedAccountId || loading) return;
    loadManagerLevel(managerLevel, selectedAccountId, true).catch((err) =>
      setError(err instanceof Error ? err.message : "Erro.")
    );
  }, [selectedAccountId, datePreset, managerLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedAccountId || loading) return;
    if (managerLevel === "adsets") {
      loadAdSets(selectedAccountId, selectedCampaignId || undefined).catch(
        (err) => setError(err instanceof Error ? err.message : "Erro.")
      );
    }
  }, [selectedCampaignId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedAccountId || loading) return;
    if (managerLevel === "ads") {
      loadAds(selectedAccountId, selectedAdSetId || undefined).catch((err) =>
        setError(err instanceof Error ? err.message : "Erro.")
      );
    }
  }, [selectedAdSetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const matchesStatus = (status: string) =>
    statusFilter === "all" || status === statusFilter;

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter(
      (c) =>
        matchesStatus(c.effectiveStatus ?? c.status) &&
        (!q || c.name.toLowerCase().includes(q))
    );
  }, [campaigns, search, statusFilter]);

  const filteredAdSets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adSets.filter(
      (a) =>
        matchesStatus(a.effectiveStatus ?? a.status) &&
        (!q || a.name.toLowerCase().includes(q))
    );
  }, [adSets, search, statusFilter]);

  const filteredAds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ads.filter(
      (a) =>
        matchesStatus(a.effectiveStatus ?? a.status) &&
        (!q || a.name.toLowerCase().includes(q))
    );
  }, [ads, search, statusFilter]);

  const handleSelectAccount = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setSelectedCampaignId("");
    setSelectedCampaignName("");
    setSelectedAdSetId("");
    setSelectedAdSetName("");
    await fetch("/api/admin/meta/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "select", accountId }),
    });
    await loadManagerLevel(managerLevel, accountId, true);
  };

  const goToLevel = (level: ManagerLevel) => {
    setManagerLevel(level);
    setSearch("");
    if (level === "campaigns") {
      setSelectedCampaignId("");
      setSelectedCampaignName("");
      setSelectedAdSetId("");
      setSelectedAdSetName("");
    } else if (level === "adsets") {
      setSelectedAdSetId("");
      setSelectedAdSetName("");
    }
  };

  const drillToCampaign = (campaign: MetaAdsCampaign) => {
    setSelectedCampaignId(campaign.id);
    setSelectedCampaignName(campaign.name);
    setSelectedAdSetId("");
    setSelectedAdSetName("");
    setManagerLevel("adsets");
    setSearch("");
  };

  const drillToAdSet = (adSet: MetaAdsAdSet) => {
    if (!selectedCampaignId && adSet.campaignId) {
      const parent = campaigns.find((c) => c.id === adSet.campaignId);
      setSelectedCampaignId(adSet.campaignId);
      setSelectedCampaignName(parent?.name ?? "");
    }
    setSelectedAdSetId(adSet.id);
    setSelectedAdSetName(adSet.name);
    setManagerLevel("ads");
    setSearch("");
  };

  const toggleStatus = async (
    id: string,
    currentStatus: string,
    level: ManagerLevel
  ) => {
    const next = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const endpoint =
      level === "campaigns"
        ? `/api/admin/meta/campaigns/${id}`
        : level === "adsets"
          ? `/api/admin/meta/adsets/${id}`
          : `/api/admin/meta/ads/${id}`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Erro ao atualizar status.");
      return;
    }
    await loadManagerLevel(managerLevel, selectedAccountId, false);
  };

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "Resumo" },
    { id: "manager", label: "Gerenciador" },
    { id: "accounts", label: "Contas" },
    { id: "utms", label: "UTMs" },
  ];

  const searchPlaceholder =
    managerLevel === "campaigns"
      ? "Filtrar campanhas..."
      : managerLevel === "adsets"
        ? "Filtrar conjuntos..."
        : "Filtrar anúncios...";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl italic">Meta Ads</h2>
          <p className="mt-1 text-sm text-muted">
            Campanha → Conjunto → Anúncio, igual ao Gerenciador da Meta
          </p>
        </div>
        <button
          onClick={() => refreshAll(true)}
          disabled={syncing}
          className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs hover:border-accent hover:text-accent disabled:opacity-40"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : "Atualizar"}
        </button>
      </div>

      {!configured && (
        <div className="flex items-start gap-3 rounded border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs text-yellow-200/90">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Token não configurado</p>
            <p className="mt-1 text-yellow-200/70">{statusMessage}</p>
          </div>
        </div>
      )}

      {configured && accounts.length > 0 && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-300/90">
          <CheckCircle2 size={14} />
          {accounts.length} conta(s) sincronizada(s)
        </div>
      )}

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/5 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "manager") && (
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Conta"
            value={selectedAccountId}
            onChange={handleSelectAccount}
            options={accounts.map((a) => ({
              value: a.accountId,
              label: `${a.name} (${a.accountId})`,
            }))}
          />
          <FilterSelect
            label="Período"
            value={datePreset}
            onChange={setDatePreset}
            options={DATE_PRESETS.map((p) => ({
              value: p.id,
              label: p.label,
            }))}
          />
          {tab === "manager" && (
            <>
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                options={[
                  { value: "all", label: "Qualquer" },
                  { value: "ACTIVE", label: "Ativo" },
                  { value: "PAUSED", label: "Pausado" },
                ]}
              />
              <div className="flex min-w-[200px] flex-1 items-center gap-2 border border-white/10 px-3 py-2">
                <Search size={14} className="text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
                />
              </div>
              <MetaColumnPicker
                level={managerLevel}
                visibleIds={visibleColumnIds}
                onChange={handleColumnsChange}
              />
            </>
          )}
        </div>
      )}

      {tab === "summary" && selectedAccountId && (
        <MetaSummaryPanel
          accountId={selectedAccountId}
          datePreset={datePreset}
          accounts={accounts.map((a) => ({
            accountId: a.accountId,
            name: a.name,
          }))}
          onAccountChange={handleSelectAccount}
          onDatePresetChange={setDatePreset}
          datePresets={DATE_PRESETS}
        />
      )}

      {tab === "summary" && !selectedAccountId && (
        <div className="rounded border border-white/10 p-8 text-center text-sm text-muted">
          Sincronize uma conta de anúncio para ver o resumo.
        </div>
      )}

      {tab === "manager" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 border border-white/10 p-1">
            {MANAGER_TABS.map((mt) => (
              <button
                key={mt.id}
                onClick={() => goToLevel(mt.id)}
                className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                  managerLevel === mt.id
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:text-white"
                }`}
              >
                {mt.label}
              </button>
            ))}
          </div>

          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted">
            <button
              onClick={() => goToLevel("campaigns")}
              className={`hover:text-white ${managerLevel === "campaigns" ? "text-accent" : ""}`}
            >
              Todas as campanhas
            </button>
            {selectedCampaignName && (
              <>
                <ChevronRight size={12} />
                <button
                  onClick={() => goToLevel("adsets")}
                  className={`hover:text-white ${managerLevel === "adsets" ? "text-accent" : ""}`}
                >
                  {selectedCampaignName}
                </button>
              </>
            )}
            {selectedAdSetName && (
              <>
                <ChevronRight size={12} />
                <span className="text-accent">{selectedAdSetName}</span>
              </>
            )}
          </nav>

          {levelLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={24} />
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10">
              {managerLevel === "campaigns" && (
                <MetaManagerTable
                  level={managerLevel}
                  columns={activeColumns}
                  rows={filteredCampaigns as MetaTableRow[]}
                  context={tableContext}
                  countLabel={`${filteredCampaigns.length} CAMPANHAS`}
                  emptyMessage={
                    configured
                      ? "Nenhuma campanha nesta conta."
                      : "Configure o token para sincronizar."
                  }
                  onNameClick={(row) => drillToCampaign(row as MetaAdsCampaign)}
                  onToggle={(row) =>
                    toggleStatus(row.id, row.status, "campaigns")
                  }
                  getSubtext={(row) =>
                    "objective" in row && row.objective ? row.objective : "—"
                  }
                />
              )}

              {managerLevel === "adsets" && (
                <MetaManagerTable
                  level={managerLevel}
                  columns={activeColumns}
                  rows={filteredAdSets as MetaTableRow[]}
                  context={tableContext}
                  countLabel={`${filteredAdSets.length} CONJUNTOS`}
                  emptyMessage={
                    selectedCampaignId
                      ? "Nenhum conjunto nesta campanha."
                      : "Selecione uma campanha ou filtre na lista."
                  }
                  onNameClick={(row) => drillToAdSet(row as MetaAdsAdSet)}
                  onToggle={(row) =>
                    toggleStatus(row.id, row.status, "adsets")
                  }
                  getSubtext={(row) =>
                    "optimizationGoal" in row && row.optimizationGoal
                      ? row.optimizationGoal
                      : "—"
                  }
                />
              )}

              {managerLevel === "ads" && (
                <MetaManagerTable
                  level={managerLevel}
                  columns={activeColumns}
                  rows={filteredAds as MetaTableRow[]}
                  context={tableContext}
                  countLabel={`${filteredAds.length} ANÚNCIOS`}
                  emptyMessage={
                    selectedAdSetId
                      ? "Nenhum anúncio neste conjunto."
                      : "Selecione um conjunto para ver os anúncios."
                  }
                  onToggle={(row) => toggleStatus(row.id, row.status, "ads")}
                  getSubtext={(row) =>
                    "creativeName" in row && row.creativeName
                      ? row.creativeName
                      : "—"
                  }
                />
              )}
            </div>
          )}
        </div>
      )}

      {tab === "accounts" && (
        <AccountsList
          accounts={accounts}
          onSelect={handleSelectAccount}
        />
      )}

      {tab === "utms" && (
        <UtmsPanel copied={copied} onCopy={copyText} />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2 border border-white/10 px-3 py-2">
      <span className="text-[10px] text-muted uppercase">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[220px] bg-transparent text-xs outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-black">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AccountsList({
  accounts,
  onSelect,
}: {
  accounts: MetaAdAccount[];
  onSelect: (id: string) => void;
}) {
  if (accounts.length === 0) {
    return (
      <div className="rounded border border-white/10 p-8 text-center text-sm text-muted">
        Nenhuma conta sincronizada.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {accounts.map((a) => (
        <div
          key={a.accountId}
          className={`flex flex-wrap items-center justify-between gap-4 border p-4 ${
            a.isSelected ? "border-accent/40 bg-accent/5" : "border-white/10"
          }`}
        >
          <div>
            <p className="text-sm font-medium">{a.name}</p>
            <p className="text-[10px] text-muted">{a.accountId}</p>
          </div>
          <div className="text-right text-xs">
            <p>Gasto total: {formatBRL(a.amountSpent)}</p>
            {!a.isSelected && (
              <button
                onClick={() => onSelect(a.accountId)}
                className="mt-2 text-accent hover:underline"
              >
                Usar esta conta
              </button>
            )}
            {a.isSelected && (
              <span className="mt-2 inline-block text-accent">Conta ativa</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function UtmsPanel({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Cole os parâmetros nos seus anúncios do Facebook / Instagram.
      </p>
      {Object.entries(META_UTM_TEMPLATES).map(([key, tpl]) => (
        <div key={key} className="border border-white/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{tpl.label}</p>
              <code className="mt-2 block break-all text-[11px] text-accent">
                {tpl.params}
              </code>
            </div>
            <button
              onClick={() => onCopy(key, tpl.params)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[10px] hover:border-accent"
            >
              <Copy size={12} />
              {copied === key ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
