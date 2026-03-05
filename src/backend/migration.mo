import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
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

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<Text, Product>;
    userProductIds : Map.Map<Text, [Text]>;
    nextId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<Text, Product>;
    userProductIds : Map.Map<Text, [Text]>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    { old with nextId = 0 };
  };
};
