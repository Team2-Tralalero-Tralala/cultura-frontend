function App() {
  return (
    <CommunityCard
      name="ชุมชนบ้านห้วยไล่วัดกลางดอน"
      imageUrl="https://scontent.futp1-1.fna.fbcdn.net/v/t39.30808-6/296108082_1205436640243819_6795992127038476452_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=OVTRUSnOooUQ7kNvwHMrG_T&_nc_oc=AdkMuOA2r5RWGQ1AfjqJFz1yqbh8-iI0y_m1GQsEwkYvxyrz_oxd3zMKrNTrOgJTV5UfSLMSevu9EBD2zmW_yQK-&_nc_zt=23&_nc_ht=scontent.futp1-1.fna&_nc_gid=O85krrkcvON_OPHg6PZi2Q&oh=00_AfabzRnFZ4n5AOZifK4KwV_RJNzRAAUo-bp-D1LTmHoyAg&oe=68C213BA"
    />
  );
}
// Child component
function CommunityCard(props: { name: string; imageUrl: string }) {
  return (
    <div className="flex flex-row justify-center mt-10">
      <div className="mx-2 w-40 h-50 bg-white rounded-xl border overflow-hidden text-center p-4">
        <img
          className="mx-auto h-24 w-24 rounded-full bg-gray-300"
          src={props.imageUrl}
        />
        <h2 className="mt-3 text-base font-bold text-gray-800">{props.name}</h2>
      </div>
    </div>
  );
}

export default App;
