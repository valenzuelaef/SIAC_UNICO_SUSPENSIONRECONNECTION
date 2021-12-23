using System.Web.Mvc;
using System.Web.Optimization;

namespace Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection
{
    public class SuspensionReconnectionAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "SuspensionReconnection";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "SuspensionReconnection_default",
                "SuspensionReconnection/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );

            RegisterBundles(BundleTable.Bundles);
        }

        private void RegisterBundles(BundleCollection bundles)
        {
            Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Utils.BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
        

    }
}