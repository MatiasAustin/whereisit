'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Order, StravaPreOrder, StravaOrderStatus, NotifyListEntry } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useToast } from '@/lib/toastContext';
import { getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';
import { 
  ShoppingBag, 
  Search, 
  Bell,
  CheckCircle2, 
  X,
  Layers,
  Sparkles,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Settings,
  Save,
  Trash2,
  Plus
} from 'lucide-react';

const STRAVA_STATUS_LIST: StravaOrderStatus[] = [
  'Menunggu Pembayaran',
  'Dibayar — Data Belum Lengkap',
  'Data Diterima — Menunggu Konfirmasi Desain',
  'Desain Dikonfirmasi',
  'Produksi',
  'QC / Finishing',
  'Packing',
  'Dikirim',
  'Selesai',
];

export default function OrdersPage() {
  const { showSuccess, showError } = useToast();
  
  // Section Mode: 'STRAVA' | 'NOTIFY' | 'STORE'
  const [activeSection, setActiveSection] = useState<'STORE' | 'STRAVA' | 'NOTIFY'>('STRAVA');

  // Notify List State
  const [notifyList, setNotifyList] = useState<NotifyListEntry[]>([]);
  const [loadingNotify, setLoadingNotify] = useState(true);

  // Store Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROCESSING' | 'PRINTING' | 'SHIPPED' | 'DELIVERED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Strava Pre-Orders State
  const [stravaOrders, setStravaOrders] = useState<StravaPreOrder[]>([]);
  const [loadingStrava, setLoadingStrava] = useState(true);
  const [stravaFilter, setStravaFilter] = useState<string>('ALL');
  const [selectedStravaOrder, setSelectedStravaOrder] = useState<StravaPreOrder | null>(null);

  // Queue Settings & Custom Status State
  const [leadDays, setLeadDays] = useState(7);
  const [leadNote, setLeadNote] = useState('');
  const [queueTitle, setQueueTitle] = useState('Antrian Produksi Saat Ini');
  const [queueSubtitle, setQueueSubtitle] = useState(
    'Transparansi proses cetak di workshop Kab. Karawang. Diperbarui setiap perubahan status oleh admin.'
  );
  const [card1Title, setCard1Title] = useState('Total PO Antrian');
  const [card1Subtitle, setCard1Subtitle] = useState('pesanan aktif');
  const [card2Title, setCard2Title] = useState('Sedang Dicetak');
  const [card2Subtitle, setCard2Subtitle] = useState('di mesin print saat ini');
  const [card3Title, setCard3Title] = useState('Estimasi Produksi');
  const [card3Subtitle, setCard3Subtitle] = useState('sejak desain dikonfirmasi');
  const [card4Title, setCard4Title] = useState('Pengiriman PO');
  const [card4Subtitle, setCard4Subtitle] = useState('ketentuan pre-order');
  const [card4Value, setCard4Value] = useState('Dikirim dalam 10 hari');
  const [stageLabels, setStageLabels] = useState<Record<string, string>>({
    'Menunggu Pembayaran': 'Menunggu Pembayaran',
    'Dibayar — Data Belum Lengkap': 'Data Belum Lengkap',
    'Data Diterima — Menunggu Konfirmasi Desain': 'Review Desain 3D',
    'Desain Dikonfirmasi': 'Siap Cetak',
    'Produksi': 'Sedang Dicetak',
    'QC / Finishing': 'QC & Finishing',
    'Packing': 'Packing',
    'Dikirim': 'Dalam Pengiriman',
    'Selesai': 'Selesai',
  });
  const [settingsActiveTab, setSettingsActiveTab] = useState<'LEAD' | 'CARDS' | 'STAGES'>('LEAD');
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Detail Modal Edit fields (Comprehensive, nothing hardcoded)
  const [editStatus, setEditStatus] = useState<StravaOrderStatus>('Data Diterima — Menunggu Konfirmasi Desain');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editCustomerAddress, setEditCustomerAddress] = useState('');
  const [editCustomerCity, setEditCustomerCity] = useState('');
  const [editVariationName, setEditVariationName] = useState('');
  const [editPrice, setEditPrice] = useState(119000);
  const [editTotal, setEditTotal] = useState(119000);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editPace, setEditPace] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editEngravedText, setEditEngravedText] = useState('');
  const [editStravaUrl, setEditStravaUrl] = useState('');
  const [editBuyerNotes, setEditBuyerNotes] = useState('');
  const [editCourier, setEditCourier] = useState('');
  const [editResi, setEditResi] = useState('');
  const [editEstDate, setEditEstDate] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editAssignedMachine, setEditAssignedMachine] = useState('');
  const [savingDetail, setSavingDetail] = useState(false);

  // Manual Pre-Order Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualFullName, setManualFullName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCity, setManualCity] = useState('Jakarta');
  const [manualAddress, setManualAddress] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualVariationId, setManualVariationId] = useState('var-10x5');
  const [manualVariationName, setManualVariationName] = useState('10x5 cm');
  const [manualPrice, setManualPrice] = useState(119000);
  const [manualStatus, setManualStatus] = useState<StravaOrderStatus>('Data Diterima — Menunggu Konfirmasi Desain');
  const [manualPayment, setManualPayment] = useState('WhatsApp Manual Order');
  const [manualStravaUrl, setManualStravaUrl] = useState('');
  const [manualEventName, setManualEventName] = useState('');
  const [manualEngravedText, setManualEngravedText] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  // Fetch regular orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Strava orders
  const fetchStravaOrders = async () => {
    setLoadingStrava(true);
    try {
      const res = await fetch('/api/strava-orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const filtered = data.data.filter((o: any) => !o.isExample && !String(o.id).includes('EXAMPLE'));
        setStravaOrders(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStrava(false);
    }
  };

  // Fetch queue settings
  const fetchQueueSettings = async () => {
    try {
      const res = await fetch('/api/strava-orders/queue');
      const data = await res.json();
      if (data.success && data.data?.stats) {
        const s = data.data.stats;
        const q = s.settings || {};
        setLeadDays(q.defaultLeadDays ?? s.avgLeadDays ?? 7);
        setLeadNote(q.customLeadNote ?? s.customNote ?? '');
        if (q.queueTitle) setQueueTitle(q.queueTitle);
        if (q.queueSubtitle) setQueueSubtitle(q.queueSubtitle);
        if (q.card1Title) setCard1Title(q.card1Title);
        if (q.card1Subtitle) setCard1Subtitle(q.card1Subtitle);
        if (q.card2Title) setCard2Title(q.card2Title);
        if (q.card2Subtitle) setCard2Subtitle(q.card2Subtitle);
        if (q.card3Title) setCard3Title(q.card3Title);
        if (q.card3Subtitle) setCard3Subtitle(q.card3Subtitle);
        if (q.card4Title) setCard4Title(q.card4Title);
        if (q.card4Subtitle) setCard4Subtitle(q.card4Subtitle);
        if (q.card4Value) setCard4Value(q.card4Value);
        if (q.stageLabels) {
          setStageLabels((prev) => ({ ...prev, ...q.stageLabels }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch notify list
  const fetchNotifyList = async () => {
    setLoadingNotify(true);
    try {
      const res = await fetch('/api/notify');
      const data = await res.json();
      if (data.success) {
        setNotifyList(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotify(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStravaOrders();
    fetchQueueSettings();
    fetchNotifyList();
  }, []);

  // Update Store Order Status
  const handleUpdateStatus = async (id: string, orderStatus: Order['orderStatus']) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, orderStatus }),
      });
      showSuccess(`Status pesanan #${id} berhasil diubah menjadi ${orderStatus}!`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus } : null));
      }
    } catch (e) {
      showError('Gagal memperbarui status pesanan.');
    }
  };

  // Update Strava Order Status (With guard check)
  const handleUpdateStravaStatus = async (id: string, status: StravaOrderStatus, productionUpdates?: any) => {
    const targetOrder = stravaOrders.find((o) => o.id === id);

    // GUARD: Cannot advance to 'Produksi' if data is incomplete!
    if (
      status === 'Produksi' &&
      (!targetOrder?.stravaData || !targetOrder.stravaData.stravaUrl || targetOrder.status === 'Dibayar — Data Belum Lengkap')
    ) {
      showError('Tidak dapat memulai produksi: Data Strava belum diisi pembeli atau belum dikonfirmasi desainnya.');
      return;
    }

    try {
      const res = await fetch('/api/strava-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, productionUpdates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status');
      }

      showSuccess(`Status pesanan #${id} berhasil diubah menjadi: ${status}`);
      await fetchStravaOrders();

      if (selectedStravaOrder && selectedStravaOrder.id === id) {
        setSelectedStravaOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      showError(err.message || 'Gagal memperbarui status pesanan Strava');
    }
  };

  // Save all detail updates from Strava detail modal (nothing hardcoded)
  const handleSaveStravaDetail = async () => {
    if (!selectedStravaOrder) return;
    setSavingDetail(true);

    try {
      const res = await fetch('/api/strava-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStravaOrder.id,
          status: editStatus,
          customer: {
            ...selectedStravaOrder.customer,
            fullName: editCustomerName.trim(),
            phone: editCustomerPhone.trim(),
            email: editCustomerEmail.trim(),
            address: editCustomerAddress.trim(),
            city: editCustomerCity.trim(),
          },
          variationName: editVariationName.trim(),
          price: Number(editPrice),
          total: Number(editTotal),
          stravaData: selectedStravaOrder.stravaData
            ? {
                ...selectedStravaOrder.stravaData,
                eventName: editEventName.trim(),
                eventDate: editEventDate.trim(),
                distance: editDistance.trim(),
                pace: editPace.trim(),
                duration: editDuration.trim(),
                engravedText: editEngravedText.trim(),
                stravaUrl: editStravaUrl.trim(),
                adminNotes: editBuyerNotes.trim(),
              }
            : undefined,
          productionUpdates: {
            ...selectedStravaOrder.production,
            courierName: editCourier.trim(),
            courier: editCourier.trim(),
            trackingNumber: editResi.trim(),
            resiNumber: editResi.trim(),
            estimatedCompletionDate: editEstDate.trim(),
            adminNotes: editAdminNotes.trim(),
            internalAdminNotes: editAdminNotes.trim(),
            assignedMachine: editAssignedMachine.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan detail');
      }

      showSuccess('Semua detail pesanan & status berhasil diperbarui!');
      await fetchStravaOrders();
      setSelectedStravaOrder(null);
    } catch (err: any) {
      showError(err.message || 'Gagal menyimpan detail pesanan');
    } finally {
      setSavingDetail(false);
    }
  };

  // Open Strava Detail Modal with all editable fields initialized
  const openStravaDetail = (order: StravaPreOrder) => {
    setSelectedStravaOrder(order);
    setEditStatus(order.status);
    setEditCustomerName(order.customer?.fullName || '');
    setEditCustomerPhone(order.customer?.phone || '');
    setEditCustomerEmail(order.customer?.email || '');
    setEditCustomerAddress(order.customer?.address || '');
    setEditCustomerCity(order.customer?.city || '');
    setEditVariationName(order.variationName || '');
    setEditPrice(order.price || 119000);
    setEditTotal(order.total || 119000);
    setEditEventName(order.stravaData?.eventName || '');
    setEditEventDate(order.stravaData?.eventDate || '');
    setEditDistance(order.stravaData?.distance || '');
    setEditPace(order.stravaData?.pace || '');
    setEditDuration(order.stravaData?.duration || '');
    setEditEngravedText(order.stravaData?.engravedText || '');
    setEditStravaUrl(order.stravaData?.stravaUrl || '');
    setEditBuyerNotes(order.stravaData?.adminNotes || '');
    setEditCourier(order.production?.courierName || order.production?.courier || 'JNE');
    setEditResi(order.production?.trackingNumber || order.production?.resiNumber || '');
    setEditEstDate(order.production?.estimatedCompletionDate || '');
    setEditAdminNotes(order.production?.adminNotes || order.production?.internalAdminNotes || '');
    setEditAssignedMachine(order.production?.assignedMachine || '');
  };

  // Delete Strava Order from Queue
  const handleDeleteStravaOrder = async (id: string, orderNumber?: string) => {
    const label = orderNumber || id;
    if (!confirm(`Hapus pesanan "${label}" dari antrian produksi? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/strava-orders?orderId=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message || `Pesanan ${label} berhasil dihapus.`);
        setStravaOrders((prev) => prev.filter((o) => o.id !== id && o.orderNumber !== id));
        if (selectedStravaOrder && (selectedStravaOrder.id === id || selectedStravaOrder.orderNumber === id)) {
          setSelectedStravaOrder(null);
        }
      } else {
        showError(data.error || 'Gagal menghapus pesanan.');
      }
    } catch {
      showError('Gagal menghapus pesanan.');
    }
  };


  // Create Manual Pre-Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFullName.trim() || !manualPhone.trim()) {
      showError('Nama lengkap dan nomor WhatsApp wajib diisi');
      return;
    }
    setSavingManual(true);
    try {
      const res = await fetch('/api/strava-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: manualFullName.trim(),
            phone: manualPhone.trim(),
            email: manualEmail.trim() || undefined,
            city: manualCity.trim() || 'Indonesia',
            address: manualAddress.trim() || undefined,
          },
          variationId: manualVariationId,
          variationName: manualVariationName,
          price: Number(manualPrice),
          subtotal: Number(manualPrice),
          shippingFee: 0,
          total: Number(manualPrice),
          status: manualStatus,
          paymentMethod: manualPayment,
          stravaData: manualStravaUrl.trim() ? {
            stravaUrl: manualStravaUrl.trim(),
            eventName: manualEventName.trim() || 'Custom Route Run',
            engravedText: manualEngravedText.trim(),
            adminNotes: manualNotes.trim(),
          } : undefined,
          internalAdminNotes: manualNotes.trim() || 'Pesanan manual via WhatsApp admin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      showSuccess('Pesanan manual berhasil ditambahkan dan masuk antrian live!');
      setShowManualModal(false);
      // Reset form
      setManualFullName('');
      setManualPhone('');
      setManualAddress('');
      setManualEmail('');
      setManualStravaUrl('');
      setManualEventName('');
      setManualEngravedText('');
      setManualNotes('');
      await fetchStravaOrders();
    } catch (err: any) {
      showError(err.message || 'Gagal membuat pesanan manual');
    } finally {
      setSavingManual(false);
    }
  };

  // Save Queue Lead Settings
  const handleSaveQueueSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/strava-orders/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultLeadDays: Number(leadDays),
          customLeadNote: leadNote,
          queueTitle,
          queueSubtitle,
          card1Title,
          card1Subtitle,
          card2Title,
          card2Subtitle,
          card3Title,
          card3Subtitle,
          card4Title,
          card4Subtitle,
          card4Value,
          stageLabels,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      showSuccess('Pengaturan antrian, kartu & status publik berhasil diperbarui!');
      setShowSettingsModal(false);
    } catch (err: any) {
      showError('Gagal menyimpan pengaturan antrian');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered regular store orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== 'ALL' && o.orderStatus !== activeTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, activeTab, search]);

  // Filtered Strava Pre-Orders
  const filteredStravaOrders = useMemo(() => {
    return stravaOrders.filter((o) => {
      if (stravaFilter !== 'ALL' && o.status !== stravaFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.stravaData?.eventName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stravaOrders, stravaFilter, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Fulfillment & Studio Queue</span>
          <h1 className="text-2xl font-black text-[#14191F]">Studio Orders & Production Queue</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Kelola pesanan toko reguler dan antrian produksi 3D print Keychain Strava.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ECE6DC]/60 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSection('STRAVA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'STRAVA'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:text-[#14191F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8BA1B4]" />
            <span>Pre-Order Strava ({stravaOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('NOTIFY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'NOTIFY'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:text-[#14191F]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#5C7489]" />
            <span>Notify Coming Soon ({notifyList.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('STORE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'STORE'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:text-[#14191F]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesanan Toko ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* ---------------- SECTION 1: STRAVA PRE-ORDERS ---------------- */}
      {activeSection === 'STRAVA' && (
        <div className="space-y-6">
          
          {/* Action & Queue Settings Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#ECE6DC] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14191F]">Pengaturan Antrian Publik</h3>
                <p className="text-[11px] text-[#7A8B99]">
                  Estimasi pengerjaan saat ini: <strong>{leadDays} hari kerja</strong> • {leadNote || '5–7 hari kerja sejak konfirmasi desain'}
                </p>
              </div>
            </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Order Manual</span>
              </button>

              <a
                href="/admin/content/keychain-media"
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#F2EDE4] transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5C7489]" />
                <span>Media &amp; YouTube</span>
              </a>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#F2EDE4] transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pengaturan Antrian &amp; Status</span>
              </button>
            </div>
          </div>

          {/* Main Table Card for Strava */}
          <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
            
            {/* Search and Filters */}
            <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Order ID, nama pelari, event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              {/* Status Filter Tabs (9 Statuses) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {['ALL', ...STRAVA_STATUS_LIST].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStravaFilter(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                      stravaFilter === tab
                        ? 'bg-[#14191F] text-white'
                        : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                    }`}
                  >
                    {tab === 'ALL' ? 'Semua' : tab.replace('Data Diterima — Menunggu Konfirmasi Desain', 'Review Desain')}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
                  <tr>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5">Pemesan</th>
                    <th className="px-6 py-3.5">Variasi</th>
                    <th className="px-6 py-3.5">Status Data Strava</th>
                    <th className="px-6 py-3.5">Tahap Produksi</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {loadingStrava ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-[#7A8B99]">
                        Memuat data pesanan Strava...
                      </td>
                    </tr>
                  ) : filteredStravaOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-[#7A8B99]">
                        Tidak ada pesanan Strava yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredStravaOrders.map((o) => {
                      const hasData = Boolean(o.stravaData?.stravaUrl);

                      return (
                        <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#14191F]">
                            #{o.id}
                          </td>

                          <td className="px-6 py-4 text-[#7A8B99]">
                            {new Date(o.createdAt).toLocaleDateString('id-ID')}
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-bold text-[#14191F]">{o.customer.fullName}</p>
                            <p className="text-[11px] text-[#5C7489]">{o.customer.phone}</p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#14191F]">{o.variationName}</p>
                            <span className="text-[10px] text-[#7A8B99]">{formatRupiah(o.total)}</span>
                          </td>

                          <td className="px-6 py-4">
                            {hasData ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{o.stravaData?.eventName || 'Data Masuk'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>Belum Diisi Pembeli</span>
                              </span>
                            )}
                          </td>

                          {/* Production Stage Selector */}
                          <td className="px-6 py-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateStravaStatus(o.id, e.target.value as StravaOrderStatus)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] border border-[#DDD5C7] text-[#14191F] focus:outline-none focus:border-[#5C7489]"
                            >
                              {STRAVA_STATUS_LIST.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openStravaDetail(o)}
                                className="px-3 py-1.5 rounded-xl bg-[#14191F] text-white hover:bg-[#5C7489] text-xs font-semibold transition-colors shadow-xs"
                              >
                                Detail &amp; Kelola
                              </button>
                              <button
                                onClick={() => handleDeleteStravaOrder(o.id, o.orderNumber)}
                                className="p-1.5 rounded-xl bg-white border border-[#DDD5C7] text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title={`Hapus pesanan #${o.id} dari antrian`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SECTION 2: COMING SOON NOTIFY LIST ---------------- */}
      {activeSection === 'NOTIFY' && (
        <div className="space-y-6">
          {(['Minat Lamp', 'Minat Cube', 'Minat Lineup Lainnya'] as const).map((group) => {
            const entries = notifyList.filter((item) => item.categoryGroup === group);
            return (
              <div key={group} className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7489]">
                      Notify List Group
                    </span>
                    <h2 className="text-lg font-black text-[#14191F]">
                      {group} ({entries.length})
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-[#556473] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
                      <tr>
                        <th className="px-6 py-3">Tanggal Daftar</th>
                        <th className="px-6 py-3">Nama</th>
                        <th className="px-6 py-3">No. WhatsApp</th>
                        <th className="px-6 py-3">Produk Diminati</th>
                        <th className="px-6 py-3 text-right">Hubungi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE3]">
                      {loadingNotify ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#7A8B99]">
                            Memuat daftar notify list...
                          </td>
                        </tr>
                      ) : entries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#7A8B99]">
                            Belum ada pendaftar di kategori {group}.
                          </td>
                        </tr>
                      ) : (
                        entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-[#FAF8F5]">
                            <td className="px-6 py-3.5 text-[#7A8B99]">
                              {new Date(entry.createdAt).toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-3.5 font-bold text-[#14191F]">{entry.name}</td>
                            <td className="px-6 py-3.5 font-mono text-[#3E5161]">{entry.whatsapp}</td>
                            <td className="px-6 py-3.5 font-semibold text-[#14191F]">{entry.product}</td>
                            <td className="px-6 py-3.5 text-right">
                              <a
                                href={`https://wa.me/${entry.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(
                                  `Halo ${entry.name}, update dari WhereIsIt mengenai ${entry.product} yang kamu nantikan!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDF3F7] border border-[#DDD5C7] text-[#14191F] font-semibold"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Chat WA</span>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- SECTION 3: STORE ORDERS ---------------- */}
      {activeSection === 'STORE' && (
        <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order #, recipient name, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {(['ALL', 'PROCESSING', 'PRINTING', 'SHIPPED', 'DELIVERED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#14191F] text-white'
                      : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Destination</th>
                  <th className="px-6 py-3.5">Courier & Payment</th>
                  <th className="px-6 py-3.5">Fulfillment Stage</th>
                  <th className="px-6 py-3.5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE3]">
                {loadingOrders ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#7A8B99]">Loading store orders...</td>
                  </tr>
                ) : filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4 font-black text-[#14191F]">#{o.orderNumber}</td>
                    <td className="px-6 py-4 text-[#7A8B99]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#14191F]">{o.customer.fullName}</p>
                      <p className="text-[11px] text-[#7A8B99]">{o.customer.email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#44505C]">{o.customer.city}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#14191F]">{o.shippingCarrier}</p>
                      <span className="text-[10px] text-[#5C7489] font-medium">{o.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value as Order['orderStatus'])}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#FAF8F5] border border-[#DDD5C7] text-[#14191F]"
                      >
                        {['PENDING', 'PROCESSING', 'PRINTING', 'SHIPPED', 'DELIVERED'].map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[#14191F]">{formatRupiah(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- STRAVA ORDER DETAIL MODAL ---------------- */}
      {selectedStravaOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white text-[#14191F] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D7] my-6 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-[#ECE6DC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5C7489] tracking-wider">
                  Kelola Pesanan Pre-Order
                </span>
                <h2 className="text-xl font-black text-[#14191F] font-mono">
                  #{selectedStravaOrder.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedStravaOrder(null)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#7A8B99] hover:text-[#14191F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* 1. Status & Tahap Produksi Selector */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#7A8B99] uppercase font-bold tracking-wider">
                    Tahap Produksi Saat Ini
                  </span>
                  <p className="text-xs text-[#556473]">
                    Pilih tahapan pesanan saat ini untuk diperbarui di antrian publik &amp; portal lacak.
                  </p>
                </div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as StravaOrderStatus)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#14191F] focus:outline-none focus:border-[#5C7489]"
                >
                  {STRAVA_STATUS_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st} {stageLabels[st] ? `(${stageLabels[st]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Customer Info (Editable) */}
              <div className="p-5 rounded-2xl border border-[#ECE6DC] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DC]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#14191F] flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#5C7489]" />
                    <span>Data Pemesan &amp; Alamat Pengiriman</span>
                  </h3>
                  <span className="text-[10px] text-[#7A8B99]">Dapat diedit jika pembeli meminta perbaikan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">No. WhatsApp / Telepon</label>
                    <input
                      type="text"
                      value={editCustomerPhone}
                      onChange={(e) => setEditCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Email</label>
                    <input
                      type="email"
                      value={editCustomerEmail}
                      onChange={(e) => setEditCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Kota</label>
                    <input
                      type="text"
                      value={editCustomerCity}
                      onChange={(e) => setEditCustomerCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Alamat Lengkap Pengiriman</label>
                    <textarea
                      rows={2}
                      value={editCustomerAddress}
                      onChange={(e) => setEditCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Product & Price (Editable) */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14191F]">
                  Variasi Produk &amp; Biaya
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Nama Variasi</label>
                    <input
                      type="text"
                      value={editVariationName}
                      onChange={(e) => setEditVariationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Total Biaya (Rp)</label>
                    <input
                      type="number"
                      value={editTotal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditTotal(val);
                        setEditPrice(val);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Strava Submitted Data Card (Editable) */}
              <div className="p-5 rounded-2xl border border-[#ECE6DC] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DC]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#14191F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5C7489]" />
                    <span>Data Rute Strava &amp; Personalisasi Plat</span>
                  </h3>
                  {selectedStravaOrder.stravaData?.submittedAt && (
                    <span className="text-[10px] text-[#7A8B99]">
                      Diserahkan: {new Date(selectedStravaOrder.stravaData.submittedAt).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Strava Link */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[#556473]">Link URL Strava</label>
                      {editStravaUrl && (
                        <a
                          href={editStravaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#5C7489] hover:underline flex items-center gap-0.5"
                        >
                          <span>Buka Tautan ↗</span>
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={editStravaUrl}
                      onChange={(e) => setEditStravaUrl(e.target.value)}
                      placeholder="https://strava.app.link/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono"
                    />
                  </div>

                  {/* Run Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#7A8B99] mb-1">Nama Event</label>
                      <input
                        type="text"
                        value={editEventName}
                        onChange={(e) => setEditEventName(e.target.value)}
                        placeholder="e.g. BDO ULTRA 2026"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#7A8B99] mb-1">Tanggal Event</label>
                      <input
                        type="text"
                        value={editEventDate}
                        onChange={(e) => setEditEventDate(e.target.value)}
                        placeholder="e.g. 10 Nov 2026"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#7A8B99] mb-1">Jarak (Distance)</label>
                      <input
                        type="text"
                        value={editDistance}
                        onChange={(e) => setEditDistance(e.target.value)}
                        placeholder="e.g. 21.1 km"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#7A8B99] mb-1">Pace / Durasi</label>
                      <input
                        type="text"
                        value={editPace}
                        onChange={(e) => setEditPace(e.target.value)}
                        placeholder="e.g. 5:24 /km"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#556473] mb-1">Durasi Total (Waktu Tempuh)</label>
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="e.g. 1h 45m"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#556473] mb-1">Teks Grafir Plat Personalisasi</label>
                      <input
                        type="text"
                        value={editEngravedText}
                        onChange={(e) => setEditEngravedText(e.target.value)}
                        placeholder="e.g. BUDI SANTOSO • SUB 2"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">Catatan Tambahan dari Pembeli</label>
                    <textarea
                      rows={2}
                      value={editBuyerNotes}
                      onChange={(e) => setEditBuyerNotes(e.target.value)}
                      placeholder="Catatan permintaan pembeli..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                    />
                  </div>

                  {/* Screenshot Previews */}
                  {selectedStravaOrder.stravaData?.images && selectedStravaOrder.stravaData.images.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-[#7A8B99] uppercase font-bold block">
                        Tangkapan Layar Rute Strava ({selectedStravaOrder.stravaData.images.length} foto)
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedStravaOrder.stravaData.images.map((img, i) => (
                          <a
                            key={i}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-2xl overflow-hidden border border-[#DDD5C7] group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={`Strava upload ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] bg-black/60 text-white font-mono">
                              Zoom ↗
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Production, Machine & Shipping Controls */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">
                  Manajemen Produksi, Mesin Cetak &amp; Pengiriman
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Estimasi Target Selesai (Publik)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Nov 2026 / 5 hari kerja"
                      value={editEstDate}
                      onChange={(e) => setEditEstDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Mesin Cetak yang Ditugaskan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prusa MK4 #1 / Bambu P1S"
                      value={editAssignedMachine}
                      onChange={(e) => setEditAssignedMachine(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Kurir Ekspedisi
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JNE Regular / SiCepat / J&T"
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Nomor Resi Pengiriman
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JNE1234567890"
                      value={editResi}
                      onChange={(e) => setEditResi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Catatan Internal Admin (Hanya terlihat di dashboard)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan pengerjaan 3D print, layer height, kendala rute, dll..."
                      value={editAdminNotes}
                      onChange={(e) => setEditAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteStravaOrder(selectedStravaOrder.id, selectedStravaOrder.orderNumber)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pesanan Ini</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={getWhatsAppAdminLink(
                      selectedStravaOrder.id,
                      `Halo ${editCustomerName || selectedStravaOrder.customer.fullName}, kami dari WhereIsIt ingin mengonfirmasi detail pesanan keychain Strava kamu.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#14191F] font-bold text-xs hover:bg-[#F2EDE4] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Chat WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedStravaOrder(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-[#FAF8F5]"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveStravaDetail}
                    disabled={savingDetail}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#14191F] hover:bg-[#5C7489] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingDetail ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- SETTINGS MODAL: QUEUE & STATUS CUSTOMIZATION ---------------- */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D7] shadow-2xl space-y-5 my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE6DC]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5C7489] tracking-wider">
                  Pengaturan Live Studio Queue
                </span>
                <h3 className="text-base font-black text-[#14191F]">
                  Kustomisasi Antrian Publik, Kartu &amp; Label Status
                </h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-[#7A8B99] hover:text-[#14191F] p-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#ECE6DC]">
              {[
                { id: 'LEAD', label: '1. Lead Time & Header' },
                { id: 'CARDS', label: '2. 4 Kartu Ringkasan (KPI)' },
                { id: 'STAGES', label: '3. Label 9 Status Antrian' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSettingsActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    settingsActiveTab === tab.id
                      ? 'bg-white text-[#14191F] shadow-xs'
                      : 'text-[#556473] hover:text-[#14191F]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto space-y-4 flex-1 text-xs pr-1">
              {settingsActiveTab === 'LEAD' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#14191F]">
                      Estimasi Hari &amp; Catatan Studio
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#556473] mb-1">
                          Default Hari Kerja (Estimasi Siap)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={leadDays}
                          onChange={(e) => setLeadDays(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-[#556473] mb-1">
                          Catatan Studio untuk Publik (Banner Kuning/Beige)
                        </label>
                        <textarea
                          rows={2}
                          value={leadNote}
                          onChange={(e) => setLeadNote(e.target.value)}
                          placeholder="e.g. Pre-order, dikirim dalam 10 hari (estimasi produksi 5-7 hari kerja sejak konfirmasi desain)"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#14191F]">
                      Header Teks Antrian Publik
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold text-[#556473] mb-1">
                          Judul Antrian
                        </label>
                        <input
                          type="text"
                          value={queueTitle}
                          onChange={(e) => setQueueTitle(e.target.value)}
                          placeholder="Antrian Produksi Saat Ini"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#556473] mb-1">
                          Deskripsi / Subtitle Antrian
                        </label>
                        <textarea
                          rows={2}
                          value={queueSubtitle}
                          onChange={(e) => setQueueSubtitle(e.target.value)}
                          placeholder="Transparansi proses cetak di workshop Kab. Karawang. Diperbarui setiap perubahan status oleh admin."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'CARDS' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#7A8B99]">
                    Kustomisasi judul dan subtext 4 kartu ringkasan di bagian atas antrian publik.
                  </p>

                  {/* Card 1 */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 1: Judul</label>
                      <input
                        type="text"
                        value={card1Title}
                        onChange={(e) => setCard1Title(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 1: Subtext</label>
                      <input
                        type="text"
                        value={card1Subtitle}
                        onChange={(e) => setCard1Subtitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                      />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3.5 rounded-2xl bg-[#EDF3F7] border border-[#C5D5E2] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#3E5161] mb-1">Kartu 2 (Sedang Cetak): Judul</label>
                      <input
                        type="text"
                        value={card2Title}
                        onChange={(e) => setCard2Title(e.target.value)}
                        placeholder="Sedang Dicetak"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#3E5161] mb-1">Kartu 2: Subtext</label>
                      <input
                        type="text"
                        value={card2Subtitle}
                        onChange={(e) => setCard2Subtitle(e.target.value)}
                        placeholder="di mesin print saat ini"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                      />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 3: Judul</label>
                      <input
                        type="text"
                        value={card3Title}
                        onChange={(e) => setCard3Title(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 3: Subtext</label>
                      <input
                        type="text"
                        value={card3Subtitle}
                        onChange={(e) => setCard3Subtitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                      />
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 4: Judul</label>
                      <input
                        type="text"
                        value={card4Title}
                        onChange={(e) => setCard4Title(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 4: Nilai Teks</label>
                      <input
                        type="text"
                        value={card4Value}
                        onChange={(e) => setCard4Value(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#556473] mb-1">Kartu 4: Subtext</label>
                      <input
                        type="text"
                        value={card4Subtitle}
                        onChange={(e) => setCard4Subtitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'STAGES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-[#7A8B99]">
                      Sesuaikan teks badge status yang ditampilkan kepada publik di antrian &amp; halaman lacak:
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setStageLabels({
                          'Menunggu Pembayaran': 'Menunggu Pembayaran',
                          'Dibayar — Data Belum Lengkap': 'Data Belum Lengkap',
                          'Data Diterima — Menunggu Konfirmasi Desain': 'Review Desain 3D',
                          'Desain Dikonfirmasi': 'Siap Cetak',
                          'Produksi': 'Sedang Dicetak',
                          'QC / Finishing': 'QC & Finishing',
                          'Packing': 'Packing',
                          'Dikirim': 'Dalam Pengiriman',
                          'Selesai': 'Selesai',
                        })
                      }
                      className="text-[10px] font-bold text-[#5C7489] hover:underline"
                    >
                      Reset Default
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STRAVA_STATUS_LIST.map((st) => (
                      <div key={st} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-1">
                        <span className="text-[10px] font-bold text-[#7A8B99] block truncate" title={st}>
                          {st}
                        </span>
                        <input
                          type="text"
                          value={stageLabels[st] ?? st}
                          onChange={(e) =>
                            setStageLabels((prev) => ({
                              ...prev,
                              [st]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE6DC]">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-[#FAF8F5]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQueueSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? 'Menyimpan...' : 'Terapkan ke Antrian Publik'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: TAMBAH PESANAN MANUAL ---------------- */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D7] shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE6DC]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C7489]">
                  Manual Pre-Order Entry
                </span>
                <h3 className="text-lg font-black text-[#14191F]">
                  + Tambah Pesanan Pre-Order Manual
                </h3>
                <p className="text-xs text-[#7A8B99]">
                  Input pesanan dari chat WhatsApp / direct channel untuk masuk antrian live studio.
                </p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#7A8B99] hover:text-[#14191F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Nama Lengkap Pelari / Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={manualFullName}
                    onChange={(e) => setManualFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Nomor WhatsApp (Aktif) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 081234567890"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Kota Pengiriman
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jakarta Selatan"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. budi@gmail.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              {/* Product & Variation Selection */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-3">
                <label className="block text-xs font-bold text-[#14191F]">
                  Pilih Variasi Produk Pre-Order *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'var-10x5', name: '10x5 cm', price: 119000, desc: 'Standard 3D Print' },
                    { id: 'var-emoney', name: '10x5 cm Emoney', price: 180000, desc: 'Termasuk E-Money' },
                    { id: 'var-flazz', name: '10x5 cm Flazz', price: 220000, desc: 'Termasuk BCA Flazz' },
                  ].map((v) => (
                    <div
                      key={v.id}
                      onClick={() => {
                        setManualVariationId(v.id);
                        setManualVariationName(v.name);
                        setManualPrice(v.price);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        manualVariationId === v.id
                          ? 'bg-[#14191F] text-white border-[#14191F] shadow-sm'
                          : 'bg-white text-[#14191F] border-[#DDD5C7] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="font-bold text-xs">{v.name}</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${manualVariationId === v.id ? 'text-[#8BA1B4]' : 'text-[#5C7489]'}`}>
                        Rp{v.price.toLocaleString('id-ID')}
                      </div>
                      <div className={`text-[10px] mt-1 ${manualVariationId === v.id ? 'text-white/70' : 'text-[#7A8B99]'}`}>
                        {v.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Harga Total (Rp)
                    </label>
                    <input
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={manualPayment}
                      onChange={(e) => setManualPayment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold"
                    >
                      <option value="WhatsApp Manual Order">WhatsApp Manual Transfer</option>
                      <option value="Direct Studio Order">Direct Studio Order</option>
                      <option value="Mayar QRIS">Mayar QRIS (Sudah Lunas)</option>
                      <option value="Cash / Studio Walk-In">Studio Walk-In</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Initial Production Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Tahap Produksi Awal
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as StravaOrderStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold text-[#14191F]"
                  >
                    {STRAVA_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Link Aktivitas Strava (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.strava.com/activities/..."
                    value={manualStravaUrl}
                    onChange={(e) => setManualStravaUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                  />
                </div>
              </div>

              {/* Event details & Engraving */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Nama Event / Lomba (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Borobudur Marathon 2026"
                    value={manualEventName}
                    onChange={(e) => setManualEventName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">
                    Teks Grafir / Custom Text (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUB 4 PB - 42.195 KM"
                    value={manualEngravedText}
                    onChange={(e) => setManualEngravedText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">
                  Catatan Workshop / Catatan Pesanan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan khusus request warna filament, instruksi khusus, dll..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE6DC]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-[#FAF8F5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-6 py-2.5 rounded-xl bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {savingManual ? 'Menyimpan...' : 'Simpan &amp; Masukkan Antrian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
