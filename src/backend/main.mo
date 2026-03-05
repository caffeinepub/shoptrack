import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import MixinStorage "./blob-storage/Mixin";



persistent actor ShopTrack {
  let accessControlState : AccessControl.AccessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ─── TYPES ────────────────────────────────────────────────────────────────

  public type UserProfile = {
    name : Text;
    email : Text;
    createdAt : Int;
  };

  type Product = {
    id : Text;
    ownerId : Text;
    productName : Text;
    category : Text;
    description : Text;
    imageId : Text;
    purchasePrice : Float;
    discount : Float;
    finalAmount : Float;
    currency : Text;
    platformName : Text;
    platformLink : Text;
    orderId : Text;
    invoiceNumber : Text;
    paymentMethod : Text;
    purchaseDate : Int;
    deliveryDate : Int;
    warrantyExpiry : Int;
    status : Text;
    address : Text;
    trackingId : Text;
    courierName : Text;
    notes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type ProductInput = {
    productName : Text;
    category : Text;
    description : Text;
    imageId : Text;
    purchasePrice : Float;
    discount : Float;
    currency : Text;
    platformName : Text;
    platformLink : Text;
    orderId : Text;
    invoiceNumber : Text;
    paymentMethod : Text;
    purchaseDate : Int;
    deliveryDate : Int;
    warrantyExpiry : Int;
    status : Text;
    address : Text;
    trackingId : Text;
    courierName : Text;
    notes : Text;
  };

  type ProductFilter = {
    search : Text;
    statusFilter : Text;
    categoryFilter : Text;
    minPrice : Float;
    maxPrice : Float;
    fromDate : Int;
    toDate : Int;
    page : Nat;
    pageSize : Nat;
    sortBy : Text;
    sortDesc : Bool;
  };

  type ProductPage = {
    items : [Product];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };

  type DashboardStats = {
    totalOrders : Nat;
    totalSpent : Float;
    receivedCount : Nat;
    cancelledCount : Nat;
    replacedCount : Nat;
    pendingCount : Nat;
    recentOrders : [Product];
  };

  type MonthlySpend = {
    month : Text;
    totalSpent : Float;
    orderCount : Nat;
  };

  type CategoryBreakdown = {
    category : Text;
    totalSpent : Float;
    count : Nat;
  };

  type StatusDistribution = {
    status : Text;
    count : Nat;
  };

  // ─── STATE ────────────────────────────────────────────────────────────────

  let userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();
  let products : Map.Map<Text, Product> = Map.empty<Text, Product>();
  let userProductIds : Map.Map<Text, [Text]> = Map.empty<Text, [Text]>();
  var nextId : Nat = 0;

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  func generateId() : Text {
    nextId += 1;
    Time.now().toText() # "-" # nextId.toText();
  };

  func getUserProducts(ownerText : Text) : [Product] {
    switch (userProductIds.get(ownerText)) {
      case (null) { [] };
      case (?ids) {
        ids.filterMap(func(id : Text) : ?Product { products.get(id) });
      };
    };
  };

  func addProductIdForUser(ownerText : Text, id : Text) {
    let current = switch (userProductIds.get(ownerText)) {
      case (null) { [] };
      case (?ids) { ids };
    };
    userProductIds.add(ownerText, current.concat([id]));
  };

  func removeProductIdForUser(ownerText : Text, id : Text) {
    switch (userProductIds.get(ownerText)) {
      case (null) {};
      case (?ids) {
        let filtered = ids.filter(func(x : Text) : Bool { x != id });
        userProductIds.add(ownerText, filtered);
      };
    };
  };

  func textContains(haystack : Text, needle : Text) : Bool {
    if (needle == "") { return true };
    let lowerNeedle = needle.toLower();
    haystack.toLower().contains(#text lowerNeedle);
  };

  func monthFromNs(ns : Int) : Text {
    let secs = ns / 1_000_000_000;
    let days = secs / 86400;
    let year = 1970 + days / 365;
    let dayOfYear = days - (year - 1970) * 365;
    let month = dayOfYear / 30 + 1;
    let m = if (month < 1) { 1 } else if (month > 12) { 12 } else { month };
    year.toText() # "-" # (if (m < 10) { "0" # m.toText() } else { m.toText() });
  };

  // ─── USER PROFILE ─────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── PRODUCT CRUD ─────────────────────────────────────────────────────────

  public shared ({ caller }) func addProduct(input : ProductInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };
    let id = generateId();
    let ownerText = caller.toText();
    let now = Time.now();
    let product : Product = {
      id;
      ownerId = ownerText;
      productName = input.productName;
      category = input.category;
      description = input.description;
      imageId = input.imageId;
      purchasePrice = input.purchasePrice;
      discount = input.discount;
      finalAmount = input.purchasePrice - input.discount;
      currency = input.currency;
      platformName = input.platformName;
      platformLink = input.platformLink;
      orderId = input.orderId;
      invoiceNumber = input.invoiceNumber;
      paymentMethod = input.paymentMethod;
      purchaseDate = input.purchaseDate;
      deliveryDate = input.deliveryDate;
      warrantyExpiry = input.warrantyExpiry;
      status = input.status;
      address = input.address;
      trackingId = input.trackingId;
      courierName = input.courierName;
      notes = input.notes;
      createdAt = now;
      updatedAt = now;
    };
    products.add(id, product);
    addProductIdForUser(ownerText, id);
    id;
  };

  public shared ({ caller }) func updateProduct(id : Text, input : ProductInput) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };
    let ownerText = caller.toText();
    switch (products.get(id)) {
      case (null) { false };
      case (?existing) {
        if (existing.ownerId != ownerText) { 
          Runtime.trap("Unauthorized: Can only update your own products");
        };
        let updated : Product = {
          id;
          ownerId = ownerText;
          productName = input.productName;
          category = input.category;
          description = input.description;
          imageId = input.imageId;
          purchasePrice = input.purchasePrice;
          discount = input.discount;
          finalAmount = input.purchasePrice - input.discount;
          currency = input.currency;
          platformName = input.platformName;
          platformLink = input.platformLink;
          orderId = input.orderId;
          invoiceNumber = input.invoiceNumber;
          paymentMethod = input.paymentMethod;
          purchaseDate = input.purchaseDate;
          deliveryDate = input.deliveryDate;
          warrantyExpiry = input.warrantyExpiry;
          status = input.status;
          address = input.address;
          trackingId = input.trackingId;
          courierName = input.courierName;
          notes = input.notes;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        products.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };
    let ownerText = caller.toText();
    switch (products.get(id)) {
      case (null) { false };
      case (?existing) {
        if (existing.ownerId != ownerText) { 
          Runtime.trap("Unauthorized: Can only delete your own products");
        };
        products.remove(id);
        removeProductIdForUser(ownerText, id);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProducts(ids : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };
    let ownerText = caller.toText();
    var count = 0;
    for (id in ids.vals()) {
      switch (products.get(id)) {
        case (null) {};
        case (?existing) {
          if (existing.ownerId == ownerText) {
            products.remove(id);
            removeProductIdForUser(ownerText, id);
            count += 1;
          };
        };
      };
    };
    count;
  };

  public query ({ caller }) func getProduct(id : Text) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };
    let ownerText = caller.toText();
    switch (products.get(id)) {
      case (null) { null };
      case (?p) {
        if (p.ownerId == ownerText) { ?p } else { null };
      };
    };
  };

  public query ({ caller }) func getProducts(filter : ProductFilter) : async ProductPage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };
    let ownerText = caller.toText();
    let allProducts = getUserProducts(ownerText);

    let filtered = allProducts.filter(func(p : Product) : Bool {
      let searchMatch = filter.search == "" or textContains(p.productName, filter.search) or textContains(p.orderId, filter.search) or textContains(p.platformName, filter.search);
      let statusMatch = filter.statusFilter == "" or p.status == filter.statusFilter;
      let categoryMatch = filter.categoryFilter == "" or textContains(p.category, filter.categoryFilter);
      let priceMatch = (filter.minPrice <= 0.0 or p.finalAmount >= filter.minPrice) and (filter.maxPrice <= 0.0 or p.finalAmount <= filter.maxPrice);
      let dateMatch = (filter.fromDate <= 0 or p.purchaseDate >= filter.fromDate) and (filter.toDate <= 0 or p.purchaseDate <= filter.toDate);
      searchMatch and statusMatch and categoryMatch and priceMatch and dateMatch;
    });

    let sorted = filtered.sort(func(a : Product, b : Product) : { #less; #equal; #greater } {
      let cmp = switch (filter.sortBy) {
        case ("price") {
          if (a.finalAmount < b.finalAmount) { #less } else if (a.finalAmount > b.finalAmount) { #greater } else { #equal };
        };
        case ("category") { Text.compare(a.category, b.category) };
        case (_) { Int.compare(a.purchaseDate, b.purchaseDate) };
      };
      if (filter.sortDesc) {
        switch (cmp) {
          case (#less) { #greater };
          case (#greater) { #less };
          case (#equal) { #equal };
        };
      } else { cmp };
    });

    let total = sorted.size();
    let ps = if (filter.pageSize == 0) { 10 } else { filter.pageSize };
    let pg = if (filter.page == 0) { 1 } else { filter.page };
    let start = if (pg > 0) { (pg - 1) * ps } else { 0 };
    let end_ = Nat.min(start + ps, total);
    let items = if (start >= total) { [] } else { sorted.sliceToArray(start, end_) };
    { items; total; page = pg; pageSize = ps };
  };

  // ─── ANALYTICS ────────────────────────────────────────────────────────────

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
    let ownerText = caller.toText();
    let allProducts = getUserProducts(ownerText);
    var totalSpent : Float = 0.0;
    var receivedCount = 0;
    var cancelledCount = 0;
    var replacedCount = 0;
    var pendingCount = 0;

    for (p in allProducts.vals()) {
      totalSpent += p.finalAmount;
      switch (p.status) {
        case ("Received") { receivedCount += 1 };
        case ("Cancelled") { cancelledCount += 1 };
        case ("Replaced") { replacedCount += 1 };
        case ("Ordered") { pendingCount += 1 };
        case ("Shipped") { pendingCount += 1 };
        case ("OutForDelivery") { pendingCount += 1 };
        case (_) {};
      };
    };

    let sortedByDate = allProducts.sort(func(a : Product, b : Product) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt);
    });
    let recentCount = Nat.min(5, sortedByDate.size());
    let recentOrders = sortedByDate.sliceToArray(0, recentCount);

    {
      totalOrders = allProducts.size();
      totalSpent;
      receivedCount;
      cancelledCount;
      replacedCount;
      pendingCount;
      recentOrders;
    };
  };

  public query ({ caller }) func getMonthlySpend() : async [MonthlySpend] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view monthly spend");
    };
    let ownerText = caller.toText();
    let allProducts = getUserProducts(ownerText);
    let monthMap : Map.Map<Text, (Float, Nat)> = Map.empty<Text, (Float, Nat)>();
    for (p in allProducts.vals()) {
      let month = monthFromNs(p.purchaseDate);
      let (spent, cnt) = switch (monthMap.get(month)) {
        case (null) { (0.0, 0) };
        case (?v) { v };
      };
      monthMap.add(month, (spent + p.finalAmount, cnt + 1));
    };
    Array.fromIter(monthMap.entries()).map(
      func((month, (totalSpent, orderCount)) : (Text, (Float, Nat))) : MonthlySpend {
        { month; totalSpent; orderCount };
      }
    );
  };

  public query ({ caller }) func getCategoryBreakdown() : async [CategoryBreakdown] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view category breakdown");
    };
    let ownerText = caller.toText();
    let allProducts = getUserProducts(ownerText);
    let catMap : Map.Map<Text, (Float, Nat)> = Map.empty<Text, (Float, Nat)>();
    for (p in allProducts.vals()) {
      let cat = if (p.category == "") { "Uncategorized" } else { p.category };
      let (spent, cnt) = switch (catMap.get(cat)) {
        case (null) { (0.0, 0) };
        case (?v) { v };
      };
      catMap.add(cat, (spent + p.finalAmount, cnt + 1));
    };
    Array.fromIter(catMap.entries()).map(
      func((category, (totalSpent, count)) : (Text, (Float, Nat))) : CategoryBreakdown {
        { category; totalSpent; count };
      }
    );
  };

  public query ({ caller }) func getStatusDistribution() : async [StatusDistribution] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view status distribution");
    };
    let ownerText = caller.toText();
    let allProducts = getUserProducts(ownerText);
    let statusMap : Map.Map<Text, Nat> = Map.empty<Text, Nat>();
    for (p in allProducts.vals()) {
      let cnt = switch (statusMap.get(p.status)) {
        case (null) { 0 };
        case (?v) { v };
      };
      statusMap.add(p.status, cnt + 1);
    };
    Array.fromIter(statusMap.entries()).map(
      func((status, count) : (Text, Nat)) : StatusDistribution {
        { status; count };
      }
    );
  };
};
